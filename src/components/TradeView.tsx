import React, { useState, useMemo, useEffect } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { TokenIcon } from './TokenIcon';
import { generateCandles, fetchRealCandles, calculateEMA, Candle } from '../services/marketService';

export const TradeView: React.FC = () => {
  const {
    coins,
    selectedSymbol,
    setSelectedSymbol,
    selectedCoin,
    orderBook,
    positions,
    orders,
    openTrade,
    closePosition,
    updatePositionTpSl,
    reversePosition,
    cancelOrder,
    favorites,
    toggleFavorite,
    setSharePnlPosition,
    setSharePnlModalOpen,
    tomanRate,
    formatTomanHuman,
  } = useExchange();

  // Trade form state
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET' | 'STOP_LIMIT'>('LIMIT');
  const [marginMode, setMarginMode] = useState<'Cross' | 'Isolated'>('Cross');
  const [leverage, setLeverage] = useState<number>(20);
  const [priceInput, setPriceInput] = useState<string>(selectedCoin.price.toString());
  const [amountInput, setAmountInput] = useState<string>('0.15');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [bottomTab, setBottomTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [tradeStatus, setTradeStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // TP/SL Modal state
  const [tpSlModalPosId, setTpSlModalPosId] = useState<string | null>(null);
  const [tpValue, setTpValue] = useState('');
  const [slValue, setSlValue] = useState('');

  // Pair selector dropdown
  const [pairDropdownOpen, setPairDropdownOpen] = useState(false);
  const [leverageModalOpen, setLeverageModalOpen] = useState(false);

  const isUsdtToman = selectedSymbol === 'USDT/TMN';
  const currentBasePrice = isUsdtToman ? tomanRate : selectedCoin.price;

  // Sync priceInput when selected coin price moves significantly or changes
  useEffect(() => {
    setPriceInput(currentBasePrice.toString());
  }, [selectedCoin.symbol, selectedSymbol, currentBasePrice]);

  // Real live candlestick data state
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateCandles(currentBasePrice, 24, timeframe)
  );
  const [isLoadingCandles, setIsLoadingCandles] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch 100% real candles from KuCoin when coin or timeframe changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCandles(true);
    fetchRealCandles(isUsdtToman ? 'USDT' : selectedCoin.symbol, timeframe, currentBasePrice).then((data) => {
      if (isMounted) {
        if (data && data.length > 0) {
          setCandles(data);
        }
        setIsLoadingCandles(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedCoin.symbol, selectedSymbol, timeframe, currentBasePrice, isUsdtToman]);

  // Real-time tick update: dynamically update latest candle as live price changes
  useEffect(() => {
    setCandles((prev) => {
      if (prev.length === 0) return prev;
      const lastIdx = prev.length - 1;
      const last = { ...prev[lastIdx] };
      last.close = currentBasePrice;
      last.high = Math.max(last.high, currentBasePrice);
      last.low = Math.min(last.low, currentBasePrice);
      const updated = [...prev];
      updated[lastIdx] = last;
      return updated;
    });
  }, [currentBasePrice]);

  // Dynamic price bounds across all visible candles
  const chartMin = useMemo(() => {
    if (candles.length === 0) return currentBasePrice * 0.98;
    return Math.min(...candles.map((c) => c.low));
  }, [candles, currentBasePrice]);

  const chartMax = useMemo(() => {
    if (candles.length === 0) return currentBasePrice * 1.02;
    return Math.max(...candles.map((c) => c.high));
  }, [candles, currentBasePrice]);

  const boundPadding = useMemo(() => {
    const spread = chartMax - chartMin;
    return spread > 0 ? spread * 0.12 : currentBasePrice * 0.005;
  }, [chartMax, chartMin, currentBasePrice]);

  const boundMin = chartMin - boundPadding;
  const boundMax = chartMax + boundPadding;
  const boundRange = Math.max(0.0001, boundMax - boundMin);

  // True calculated EMA(7) & EMA(25) from historical candle closes
  const ema7Values = useMemo(() => {
    return calculateEMA(candles.map((c) => c.close), 7);
  }, [candles]);

  const ema25Values = useMemo(() => {
    return calculateEMA(candles.map((c) => c.close), 25);
  }, [candles]);

  const maxVolume = useMemo(() => {
    if (candles.length === 0) return 1;
    return Math.max(...candles.map((c) => c.volume), 1);
  }, [candles]);

  const isStarred = favorites.includes(selectedCoin.symbol);

  const numPrice = parseFloat(priceInput) || selectedCoin.price;
  const numAmount = parseFloat(amountInput) || 0;
  const contractValue = numPrice * numAmount;
  const requiredMargin = contractValue / leverage;

  const usdtCoin = coins.find((c) => c.symbol === 'USDT');
  const availableUsdt = usdtCoin ? usdtCoin.balance : 0;

  // Liquidation Price calculation
  const estLiqPrice = useMemo(() => {
    const delta = (numPrice / leverage) * 0.9;
    return side === 'BUY' ? Math.max(0, numPrice - delta) : numPrice + delta;
  }, [numPrice, leverage, side]);

  const handlePercentageClick = (pct: number) => {
    const maxContractVal = availableUsdt * leverage;
    const targetVal = (maxContractVal * pct) / 100;
    const amt = targetVal / numPrice;
    setAmountInput(amt.toFixed(3));
  };

  const handleSubmitOrder = () => {
    setTradeStatus(null);
    if (numAmount <= 0) {
      setTradeStatus({ type: 'error', text: 'لطفاً حجم معامله را وارد کنید.' });
      return;
    }

    const res = openTrade({
      side,
      type: orderType,
      price: orderType === 'MARKET' ? selectedCoin.price : numPrice,
      amount: numAmount,
      leverage,
    });

    if (res.success) {
      setTradeStatus({ type: 'success', text: res.message });
      setTimeout(() => setTradeStatus(null), 3000);
    } else {
      setTradeStatus({ type: 'error', text: res.message });
    }
  };

  const handleOpenTpSl = (posId: string, currentTp?: number, currentSl?: number) => {
    setTpSlModalPosId(posId);
    setTpValue(currentTp ? currentTp.toString() : '');
    setSlValue(currentSl ? currentSl.toString() : '');
  };

  const handleSaveTpSl = () => {
    if (tpSlModalPosId) {
      updatePositionTpSl(
        tpSlModalPosId,
        tpValue ? parseFloat(tpValue) : undefined,
        slValue ? parseFloat(slValue) : undefined
      );
      setTpSlModalPosId(null);
    }
  };

  const handleSharePnL = (pos: any) => {
    setSharePnlPosition(pos);
    setSharePnlModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto pb-10 text-[#d4e4fa] select-none">
      {/* 1. Market Header & 24h Ticker Strip */}
      <div className="flex flex-col bg-[#0d1c2d] px-4 py-3 border-b border-white/5 gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 relative">
            <div
              onClick={() => setPairDropdownOpen(!pairDropdownOpen)}
              className="flex items-center gap-2 cursor-pointer bg-[#122131] hover:bg-[#1c2b3c] px-3 py-1.5 rounded-xl border border-white/5 transition-colors"
            >
              <TokenIcon symbol={selectedCoin.symbol} size={26} />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[16px] text-white tracking-tight">
                  {selectedSymbol}
                </span>
                <span className="text-[10px] font-bold text-[#c0c1ff] bg-[#8083ff]/20 px-1.5 py-0.5 rounded">
                  {leverage}x
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#908fa0]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Pair Selector Dropdown */}
            {pairDropdownOpen && (
              <div className="absolute top-12 right-0 w-64 bg-[#122131] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 flex flex-col gap-1 max-h-72 overflow-y-auto">
                <span className="text-[11px] text-[#908fa0] px-2 py-1 font-semibold">
                  انتخاب جفت‌ارز فیوچرز:
                </span>
                {coins.map((c) => {
                  const isCoinUsdt = c.symbol === 'USDT';
                  const targetPair = isCoinUsdt ? 'USDT/TMN' : `${c.symbol}/USDT`;
                  const isSelected = selectedSymbol === targetPair;
                  const priceLabel = isCoinUsdt
                    ? `${tomanRate.toLocaleString('fa-IR')} تومان`
                    : `$${c.price.toLocaleString(undefined, { minimumFractionDigits: c.price < 1 ? (c.price < 0.001 ? 6 : 4) : 2 })}`;
                  return (
                    <button
                      key={c.symbol}
                      onClick={() => {
                        setSelectedSymbol(targetPair);
                        setPairDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl text-[12px] hover:bg-white/5 transition-all ${
                        isSelected ? 'bg-[#8083ff]/20 text-[#c0c1ff] font-bold' : 'text-[#d4e4fa]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TokenIcon symbol={c.symbol} size={20} />
                        <span>{targetPair}</span>
                      </div>
                      <div className="flex flex-col items-end font-mono text-[11px]">
                        <span>{priceLabel}</span>
                        <span className={c.change24h >= 0 ? 'text-[#4edea3]' : 'text-[#ff516a]'}>
                          {c.change24h >= 0 ? `+${c.change24h}%` : `${c.change24h}%`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <span className="text-[11px] text-[#908fa0] hidden sm:inline">
              معاملات پرپچوال دائمی
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(selectedCoin.symbol)}
              className={`w-8 h-8 rounded-full bg-[#122131] flex items-center justify-center transition-all ${
                isStarred ? 'text-amber-400' : 'text-[#908fa0] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isStarred ? 'star' : 'star_border'}
              </span>
            </button>
            <button
              onClick={() => {
                if (positions.length > 0) handleSharePnL(positions[0]);
              }}
              className="w-8 h-8 rounded-full bg-[#122131] flex items-center justify-center text-[#908fa0] hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
          </div>
        </div>

        {/* Live Numbers Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 border-t border-white/5">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-[20px] md:text-[24px] font-black tracking-tight ${
                  selectedCoin.change24h >= 0 ? 'text-[#4edea3]' : 'text-[#ff516a]'
                }`}
                dir="ltr"
              >
                {isUsdtToman
                  ? `${tomanRate.toLocaleString('fa-IR')} تومان`
                  : `$${selectedCoin.price.toLocaleString('en-US', {
                      minimumFractionDigits: selectedCoin.price < 1 ? (selectedCoin.price < 0.001 ? 6 : 4) : 2,
                    })}`}
              </span>
              <span
                className={`font-mono text-[12px] font-bold px-1.5 py-0.5 rounded ${
                  selectedCoin.change24h >= 0 ? 'bg-[#00a572]/20 text-[#4edea3]' : 'bg-[#ff516a]/20 text-[#ff516a]'
                }`}
                dir="ltr"
              >
                {selectedCoin.change24h >= 0 ? `+${selectedCoin.change24h}%` : `${selectedCoin.change24h}%`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#908fa0] mt-0.5">
              {isUsdtToman ? (
                <>
                  <span>نرخ جهانی:</span>
                  <span className="font-mono text-[#4edea3] font-bold">≈ $1.000 USDT</span>
                  <span className="text-[#c0c1ff]">({formatTomanHuman(tomanRate)})</span>
                </>
              ) : (
                <>
                  <span>معادل تومان:</span>
                  <span className="font-mono text-[#d4e4fa] font-bold">
                    ≈ {Math.round(selectedCoin.price * tomanRate).toLocaleString('fa-IR')} تومان
                  </span>
                  <span className="text-[#4edea3] font-bold">
                    ({formatTomanHuman(selectedCoin.price * tomanRate)})
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#908fa0]">بیشترین ۲۴س:</span>
              <span className="font-mono text-[#d4e4fa]">
                {isUsdtToman
                  ? `${Math.round(tomanRate * 1.012).toLocaleString('fa-IR')} تومان`
                  : `$${selectedCoin.high24h.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[#908fa0]">کمترین ۲۴س:</span>
              <span className="font-mono text-[#d4e4fa]">
                {isUsdtToman
                  ? `${Math.round(tomanRate * 0.988).toLocaleString('fa-IR')} تومان`
                  : `$${selectedCoin.low24h.toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="flex flex-col text-[11px] hidden md:flex">
            <div className="flex justify-between">
              <span className="text-[#908fa0]">حجم ۲۴س:</span>
              <span className="font-mono text-[#d4e4fa]">${selectedCoin.volume24h}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[#908fa0]">فاندینگ ریت:</span>
              <span className="font-mono text-[#4edea3]" dir="ltr">+0.0102%</span>
            </div>
          </div>

          <div className="flex flex-col text-[11px] hidden md:flex">
            <div className="flex justify-between">
              <span className="text-[#908fa0]">قیمت ورودی پیش‌فرض:</span>
              <span className="font-mono text-[#c0c1ff]">${selectedCoin.price}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[#908fa0]">پوشش بیمه:</span>
              <span className="font-mono text-[#4edea3]">$250M Insured</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Timeframe Selector & Technical Tools Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#010f1f] border-b border-white/5">
        <div className="flex items-center gap-1 overflow-x-auto">
          {['15m', '1H', '4H', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-[12px] font-mono font-bold transition-all ${
                timeframe === tf
                  ? 'bg-[#8083ff]/20 text-[#c0c1ff] shadow-sm border border-[#8083ff]/30'
                  : 'text-[#908fa0] hover:text-[#d4e4fa] hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isLoadingCandles && (
            <span className="flex items-center gap-1 text-[11px] text-[#8083ff] font-sans animate-pulse">
              <span className="material-symbols-outlined text-[13px] animate-spin">sync</span>
              <span>دریافت کندل‌های زنده...</span>
            </span>
          )}
          <div className="flex items-center gap-2 text-[11px] text-[#908fa0] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#c0c1ff]"></span>
              <span>EMA(7)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
              <span>EMA(25)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Candlestick Chart Area */}
      <div className="relative w-full bg-[#010f1f] overflow-hidden flex flex-col justify-between border-b border-white/5 select-none">
        {/* Real-time OHLCV HUD Banner */}
        {(() => {
          const active =
            hoveredIndex !== null && candles[hoveredIndex]
              ? candles[hoveredIndex]
              : candles[candles.length - 1];
          if (!active) return null;
          const isBullish = active.close >= active.open;
          const changePct = active.open > 0 ? (((active.close - active.open) / active.open) * 100).toFixed(2) : '0.00';
          return (
            <div className="flex flex-wrap items-center justify-between px-4 py-1.5 bg-[#051424]/90 border-b border-white/5 text-[11px] font-mono text-[#908fa0] z-10">
              <div className="flex items-center gap-3">
                <span className="text-[#d4e4fa] font-sans font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                  {selectedSymbol} ({timeframe})
                </span>
                <span>زمان: <strong className="text-[#d4e4fa]">{active.time}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span>باز: <strong className="text-[#d4e4fa]">{isUsdtToman ? `${active.open.toLocaleString()} ت` : `$${active.open < 1 ? active.open.toFixed(active.open < 0.001 ? 6 : 4) : active.open.toLocaleString()}`}</strong></span>
                <span>بیشترین: <strong className="text-[#4edea3]">{isUsdtToman ? `${active.high.toLocaleString()} ت` : `$${active.high < 1 ? active.high.toFixed(active.high < 0.001 ? 6 : 4) : active.high.toLocaleString()}`}</strong></span>
                <span>کمترین: <strong className="text-[#ff516a]">{isUsdtToman ? `${active.low.toLocaleString()} ت` : `$${active.low < 1 ? active.low.toFixed(active.low < 0.001 ? 6 : 4) : active.low.toLocaleString()}`}</strong></span>
                <span>بسته: <strong className={isBullish ? 'text-[#4edea3]' : 'text-[#ff516a]'}>{isUsdtToman ? `${active.close.toLocaleString()} ت` : `$${active.close < 1 ? active.close.toFixed(active.close < 0.001 ? 6 : 4) : active.close.toLocaleString()}`}</strong></span>
                <span className={`font-bold ${isBullish ? 'text-[#4edea3]' : 'text-[#ff516a]'}`} dir="ltr">
                  {isBullish ? `+${changePct}%` : `${changePct}%`}
                </span>
                <span className="text-[#908fa0]">حجم: <strong className="text-[#d4e4fa]">{active.volume.toFixed(1)}</strong></span>
              </div>
            </div>
          );
        })()}

        {/* SVG Chart Surface */}
        {(() => {
          const N = candles.length;
          const candleAreaWidth = 525;
          const candleStep = N > 1 ? (candleAreaWidth - 25) / (N - 1) : 22;
          const candleWidth = Math.max(4, Math.min(14, candleStep * 0.65));
          const chartTop = 18;
          const candleAreaHeight = 150;
          const volumeBaseY = 225;

          const getY = (p: number) => {
            const ratio = (p - boundMin) / boundRange;
            return chartTop + (1 - Math.max(0, Math.min(1, ratio))) * candleAreaHeight;
          };

          const getX = (i: number) => 15 + i * candleStep;

          // Price levels for grid and Y-axis
          const p1 = boundMax;
          const p2 = boundMin + boundRange * 0.66;
          const p3 = boundMin + boundRange * 0.33;
          const p4 = boundMin;

          // Paths for EMA
          const ema7Path = candles
            .map((_, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(ema7Values[i] || candles[i].close).toFixed(1)}`)
            .join(' ');

          const ema25Path = candles
            .map((_, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(ema25Values[i] || candles[i].close).toFixed(1)}`)
            .join(' ');

          // Subtle Area Under Trend
          const areaPoints = candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(c.close).toFixed(1)}`).join(' ');
          const lastX = getX(N - 1).toFixed(1);
          const areaPath = `${areaPoints} L ${lastX} 180 L 15 180 Z`;

          const currentPriceY = getY(selectedCoin.price);
          const lastCandleX = getX(N - 1);

          return (
            <div
              className="relative w-full h-64 md:h-80"
              onMouseLeave={() => setHoveredIndex(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = ((e.clientX - rect.left) / rect.width) * 600;
                let closestIdx = 0;
                let minDiff = Infinity;
                for (let i = 0; i < N; i++) {
                  const diff = Math.abs(getX(i) - mouseX);
                  if (diff < minDiff) {
                    minDiff = diff;
                    closestIdx = i;
                  }
                }
                setHoveredIndex(closestIdx);
              }}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 600 240"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="tradeAreaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8083ff" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#8083ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                <line x1="10" y1={getY(p1)} x2="535" y2={getY(p1)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="10" y1={getY(p2)} x2="535" y2={getY(p2)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="10" y1={getY(p3)} x2="535" y2={getY(p3)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="10" y1={getY(p4)} x2="535" y2={getY(p4)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="535" y1="10" x2="535" y2="235" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Right Y-Axis Price Labels */}
                <text x="542" y={getY(p1) + 4} fill="#908fa0" fontSize="9.5" fontFamily="JetBrains Mono">
                  {isUsdtToman ? Math.round(p1).toLocaleString() : (p1 >= 1000 ? `$${Math.round(p1).toLocaleString()}` : `$${p1 < 1 ? p1.toFixed(p1 < 0.001 ? 5 : 3) : p1.toFixed(2)}`)}
                </text>
                <text x="542" y={getY(p2) + 4} fill="#908fa0" fontSize="9.5" fontFamily="JetBrains Mono">
                  {isUsdtToman ? Math.round(p2).toLocaleString() : (p2 >= 1000 ? `$${Math.round(p2).toLocaleString()}` : `$${p2 < 1 ? p2.toFixed(p2 < 0.001 ? 5 : 3) : p2.toFixed(2)}`)}
                </text>
                <text x="542" y={getY(p3) + 4} fill="#908fa0" fontSize="9.5" fontFamily="JetBrains Mono">
                  {isUsdtToman ? Math.round(p3).toLocaleString() : (p3 >= 1000 ? `$${Math.round(p3).toLocaleString()}` : `$${p3 < 1 ? p3.toFixed(p3 < 0.001 ? 5 : 3) : p3.toFixed(2)}`)}
                </text>
                <text x="542" y={getY(p4) + 4} fill="#908fa0" fontSize="9.5" fontFamily="JetBrains Mono">
                  {isUsdtToman ? Math.round(p4).toLocaleString() : (p4 >= 1000 ? `$${Math.round(p4).toLocaleString()}` : `$${p4 < 1 ? p4.toFixed(p4 < 0.001 ? 5 : 3) : p4.toFixed(2)}`)}
                </text>

                {/* Shaded Area Under Trend */}
                <path d={areaPath} fill="url(#tradeAreaGlow)" />

                {/* Volume Histogram Bars (Bottom of Chart) */}
                {candles.map((candle, idx) => {
                  const x = getX(idx);
                  const volHeight = Math.max(3, (candle.volume / maxVolume) * 36);
                  const isBullish = candle.close >= candle.open;
                  const volColor = isBullish ? 'rgba(78, 222, 163, 0.40)' : 'rgba(255, 81, 106, 0.40)';
                  return (
                    <rect
                      key={`vol-${idx}`}
                      x={x - candleWidth / 2}
                      y={volumeBaseY - volHeight}
                      width={candleWidth}
                      height={volHeight}
                      fill={volColor}
                      rx="1"
                    />
                  );
                })}

                {/* EMA Curves */}
                <path d={ema25Path} stroke="#4edea3" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                <path d={ema7Path} stroke="#c0c1ff" strokeWidth="1.6" fill="none" strokeLinecap="round" />

                {/* Candlesticks: Wicks & Real Bodies */}
                {candles.map((candle, idx) => {
                  const x = getX(idx);
                  const isBullish = candle.close >= candle.open;
                  const color = isBullish ? '#4edea3' : '#ff516a';

                  const highY = getY(candle.high);
                  const lowY = getY(candle.low);
                  const openY = getY(candle.open);
                  const closeY = getY(candle.close);
                  const bodyTop = Math.min(openY, closeY);
                  const bodyHeight = Math.max(2.5, Math.abs(openY - closeY));

                  return (
                    <g key={`candle-${idx}`}>
                      {/* Candle Wick */}
                      <line
                        x1={x}
                        y1={highY}
                        x2={x}
                        y2={lowY}
                        stroke={color}
                        strokeWidth="1.5"
                      />
                      {/* Candle Body */}
                      <rect
                        x={x - candleWidth / 2}
                        y={bodyTop}
                        width={candleWidth}
                        height={bodyHeight}
                        rx="1.5"
                        fill={color}
                      />
                    </g>
                  );
                })}

                {/* Current Live Mark Price Laser Line */}
                <line
                  x1="10"
                  y1={currentPriceY}
                  x2="535"
                  y2={currentPriceY}
                  stroke="#8083ff"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />

                {/* Pulsing Bead on Current Live Candle */}
                <circle cx={lastCandleX} cy={currentPriceY} r="3" fill="#8083ff" />
                <circle cx={lastCandleX} cy={currentPriceY} r="7" fill="#8083ff" opacity="0.35" className="animate-ping" />

                {/* Right Axis Current Price Tag */}
                <g transform={`translate(535, ${Math.max(12, Math.min(225, currentPriceY))})`}>
                  <rect x="0" y="-9" width="62" height="18" rx="4" fill="#8083ff" />
                  <text x="31" y="3.5" fill="#0d0096" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                    {isUsdtToman ? Math.round(tomanRate).toLocaleString() : (currentBasePrice >= 1000 ? `$${Math.round(currentBasePrice).toLocaleString()}` : `$${currentBasePrice < 1 ? currentBasePrice.toFixed(currentBasePrice < 0.001 ? 5 : 3) : currentBasePrice.toFixed(2)}`)}
                  </text>
                </g>

                {/* Hover Crosshair */}
                {hoveredIndex !== null && candles[hoveredIndex] && (
                  <g pointerEvents="none">
                    <line
                      x1={getX(hoveredIndex)}
                      y1="10"
                      x2={getX(hoveredIndex)}
                      y2="235"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="10"
                      y1={getY(candles[hoveredIndex].close)}
                      x2="535"
                      y2={getY(candles[hoveredIndex].close)}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={getX(hoveredIndex)}
                      cy={getY(candles[hoveredIndex].close)}
                      r="4"
                      fill="#ffffff"
                      stroke="#8083ff"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>
            </div>
          );
        })()}

        {/* Dynamic Time Axis Labels matching real candles */}
        <div className="flex justify-between px-4 py-1.5 bg-[#0d1c2d] text-[#908fa0] text-[11px] font-mono border-t border-white/5">
          {(() => {
            if (candles.length === 0) return null;
            const step = Math.floor(candles.length / 5);
            const indices = [0, step, step * 2, step * 3, candles.length - 1];
            return indices.map((idx, i) => {
              const candle = candles[idx];
              if (!candle) return null;
              const isLast = i === indices.length - 1;
              return (
                <span
                  key={i}
                  className={isLast ? 'text-[#8083ff] font-bold flex items-center gap-1' : ''}
                >
                  {isLast && <span className="w-1.5 h-1.5 rounded-full bg-[#8083ff] animate-ping"></span>}
                  {candle.time} {isLast ? '(زنده)' : ''}
                </span>
              );
            });
          })()}
        </div>
      </div>

      {/* 4. Dual Split Trading Engine Area: Order Book & Order Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 px-4 mt-3">
        {/* RIGHT COLUMN (Order Book - 5 Cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col bg-[#0d1c2d] p-3 rounded-2xl border border-white/5 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 text-[#908fa0] font-mono text-[11px]">
            <span>قیمت (USDT)</span>
            <span>حجم ({selectedCoin.symbol})</span>
          </div>

          {/* Asks (Red / Sellers) */}
          <div className="flex flex-col gap-1">
            {orderBook.asks.map((ask, i) => (
              <div
                key={i}
                onClick={() => setPriceInput(ask.price.toString())}
                className="relative flex items-center justify-between h-5 px-1.5 rounded overflow-hidden cursor-pointer hover:bg-white/5"
              >
                <div
                  className="absolute inset-y-0 right-0 bg-[#ff516a]/15 rounded"
                  style={{ width: `${ask.depthPercent}%` }}
                ></div>
                <span className="relative z-10 font-mono text-[12px] font-bold text-[#ff516a]">
                  {ask.price.toFixed(selectedCoin.decimals)}
                </span>
                <span className="relative z-10 font-mono text-[11px] text-[#d4e4fa]">
                  {ask.amount.toFixed(3)}
                </span>
              </div>
            ))}
          </div>

          {/* Mid Market Spread Badge */}
          <div className="my-2 py-1.5 px-3 rounded-xl bg-[#122131] border border-white/5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-[#4edea3] font-mono text-[15px] font-bold">
              <span>{selectedCoin.price.toFixed(selectedCoin.decimals)}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            </div>
            <span className="text-[10px] text-[#908fa0] font-mono">
              اسپرد: {orderBook.spread} ({orderBook.spreadPercent}%)
            </span>
          </div>

          {/* Bids (Green / Buyers) */}
          <div className="flex flex-col gap-1">
            {orderBook.bids.map((bid, i) => (
              <div
                key={i}
                onClick={() => setPriceInput(bid.price.toString())}
                className="relative flex items-center justify-between h-5 px-1.5 rounded overflow-hidden cursor-pointer hover:bg-white/5"
              >
                <div
                  className="absolute inset-y-0 right-0 bg-[#00a572]/15 rounded"
                  style={{ width: `${bid.depthPercent}%` }}
                ></div>
                <span className="relative z-10 font-mono text-[12px] font-bold text-[#4edea3]">
                  {bid.price.toFixed(selectedCoin.decimals)}
                </span>
                <span className="relative z-10 font-mono text-[11px] text-[#d4e4fa]">
                  {bid.amount.toFixed(3)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[#908fa0] text-[11px]">
            <span>دقت قیمت: ۰.۱</span>
            <span className="font-mono text-[10px]">نقدینگی بالا (Level 2)</span>
          </div>
        </div>

        {/* LEFT COLUMN (Order Execution Form - 7 Cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col bg-[#0d1c2d] p-4 rounded-2xl border border-white/5 shadow-md gap-3">
          {/* Buy / Sell Switch */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#051424] border border-white/5">
            <button
              onClick={() => setSide('BUY')}
              className={`py-2 rounded-lg font-bold text-[13px] transition-all text-center flex items-center justify-center gap-1 ${
                side === 'BUY'
                  ? 'bg-[#00a572] text-[#002113] shadow-md shadow-[#4edea3]/20'
                  : 'text-[#908fa0] hover:text-[#d4e4fa]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>خرید (Long)</span>
            </button>
            <button
              onClick={() => setSide('SELL')}
              className={`py-2 rounded-lg font-bold text-[13px] transition-all text-center flex items-center justify-center gap-1 ${
                side === 'SELL'
                  ? 'bg-[#ff516a] text-white shadow-md shadow-[#ff516a]/20'
                  : 'text-[#908fa0] hover:text-[#d4e4fa]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">trending_down</span>
              <span>فروش (Short)</span>
            </button>
          </div>

          {/* Margin Mode & Leverage Pill Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMarginMode(marginMode === 'Cross' ? 'Isolated' : 'Cross')}
              className="flex-1 py-1.5 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] border border-white/5 text-[12px] font-bold text-[#d4e4fa] flex items-center justify-center gap-1"
            >
              <span>مارجین: {marginMode}</span>
              <span className="material-symbols-outlined text-[14px] text-[#908fa0]">sync</span>
            </button>

            <button
              onClick={() => setLeverageModalOpen(true)}
              className="flex-1 py-1.5 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] border border-[#8083ff]/30 text-[12px] font-mono font-bold text-[#c0c1ff] flex items-center justify-center gap-1"
            >
              <span>اهرم: {leverage}x</span>
              <span className="material-symbols-outlined text-[14px] text-amber-400">bolt</span>
            </button>
          </div>

          {/* Leverage Picker Modal */}
          {leverageModalOpen && (
            <div className="p-3 rounded-xl bg-[#051424] border border-[#8083ff]/40 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[12px]">
                <span className="font-bold text-[#c0c1ff]">تنظیم اهرم معامله (1x - 100x):</span>
                <span className="font-mono font-bold text-amber-400">{leverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full accent-[#8083ff] cursor-pointer"
              />
              <div className="flex justify-between gap-1">
                {[2, 5, 10, 20, 50, 100].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLeverage(l);
                      setLeverageModalOpen(false);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${
                      leverage === l ? 'bg-[#8083ff] text-[#051424] font-bold' : 'bg-[#122131] text-[#908fa0]'
                    }`}
                  >
                    {l}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Type Segment */}
          <div className="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-[#051424] border border-white/5 text-[11px] font-medium">
            <button
              onClick={() => setOrderType('LIMIT')}
              className={`py-1.5 rounded-lg ${
                orderType === 'LIMIT' ? 'bg-[#122131] text-[#c0c1ff] font-bold shadow' : 'text-[#908fa0]'
              }`}
            >
              سفارش محدود (Limit)
            </button>
            <button
              onClick={() => setOrderType('MARKET')}
              className={`py-1.5 rounded-lg ${
                orderType === 'MARKET' ? 'bg-[#122131] text-[#c0c1ff] font-bold shadow' : 'text-[#908fa0]'
              }`}
            >
              مارکت آنی (Market)
            </button>
            <button
              onClick={() => setOrderType('STOP_LIMIT')}
              className={`py-1.5 rounded-lg ${
                orderType === 'STOP_LIMIT' ? 'bg-[#122131] text-[#c0c1ff] font-bold shadow' : 'text-[#908fa0]'
              }`}
            >
              استاپ لیمیت
            </button>
          </div>

          {/* Price Stepper (if not market) */}
          {orderType !== 'MARKET' && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#908fa0]">{isUsdtToman ? 'قیمت ورودی (تومان)' : 'قیمت ورودی (USDT)'}</label>
              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-[#051424] border border-white/10">
                <button
                  onClick={() => setPriceInput((prev) => (parseFloat(prev) - (isUsdtToman ? 500 : 10)).toFixed(isUsdtToman ? 0 : selectedCoin.decimals))}
                  className="w-7 h-7 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] flex items-center justify-center font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="bg-transparent font-mono text-[14px] font-bold text-center text-white outline-none w-32"
                  dir="ltr"
                />
                <button
                  onClick={() => setPriceInput((prev) => (parseFloat(prev) + (isUsdtToman ? 500 : 10)).toFixed(isUsdtToman ? 0 : selectedCoin.decimals))}
                  className="w-7 h-7 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Amount Stepper */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-[#908fa0]">
              <span>حجم معامله</span>
              <span>
                موجودی مارجین: <strong className="font-mono text-[#d4e4fa]">${availableUsdt.toLocaleString()} USDT</strong>
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#051424] border border-white/10">
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="bg-transparent font-mono text-[14px] font-bold text-white outline-none w-28 text-left"
                dir="ltr"
              />
              <span className="font-mono font-bold text-[12px] text-[#908fa0]">
                {isUsdtToman ? 'USDT' : selectedCoin.symbol}
              </span>
            </div>
          </div>

          {/* Percentage Chips */}
          <div className="grid grid-cols-4 gap-1.5">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePercentageClick(pct)}
                className="py-1 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] text-[#908fa0] hover:text-[#d4e4fa] font-mono text-[11px] font-semibold text-center border border-white/5"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Stats breakdown */}
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-[#051424] border border-white/5 text-[11px] text-[#908fa0] font-mono">
            <div className="flex justify-between">
              <span>مارجین مورد نیاز:</span>
              <span className="text-[#d4e4fa] font-bold">
                {isUsdtToman ? `${Math.round(requiredMargin).toLocaleString('fa-IR')} تومان` : `$${requiredMargin.toFixed(2)} USDT`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ارزش کل قرارداد:</span>
              <span className="text-[#d4e4fa]">
                {isUsdtToman ? `${Math.round(contractValue).toLocaleString('fa-IR')} تومان` : `$${contractValue.toFixed(2)} USDT`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>قیمت تخمینی لیکوئید:</span>
              <span className="text-amber-400 font-bold">
                {isUsdtToman ? `${Math.round(estLiqPrice).toLocaleString('fa-IR')} تومان` : `$${estLiqPrice.toFixed(estLiqPrice < 1 ? (estLiqPrice < 0.001 ? 6 : 4) : 2)}`}
              </span>
            </div>
          </div>

          {tradeStatus && (
            <div
              className={`p-2 rounded-lg text-[12px] flex items-center gap-1.5 ${
                tradeStatus.type === 'error'
                  ? 'bg-[#ff516a]/15 text-[#ffb2b7] border border-[#ff516a]/30'
                  : 'bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/30'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {tradeStatus.type === 'error' ? 'error' : 'check_circle'}
              </span>
              <span>{tradeStatus.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmitOrder}
            className={`w-full py-3 rounded-xl font-bold text-[14px] shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 ${
              side === 'BUY'
                ? 'bg-gradient-to-r from-[#00a572] to-[#4edea3] text-[#002113] shadow-[#4edea3]/20'
                : 'bg-gradient-to-r from-[#e84142] to-[#ff516a] text-white shadow-[#ff516a]/20'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {side === 'BUY' ? 'trending_up' : 'trending_down'}
            </span>
            <span>
              {side === 'BUY'
                ? (isUsdtToman ? `خرید تتر (Long USDT ${leverage}x)` : `خرید سریع ${selectedCoin.symbol} (Long ${leverage}x)`)
                : (isUsdtToman ? `فروش تتر (Short USDT ${leverage}x)` : `فروش سریع ${selectedCoin.symbol} (Short ${leverage}x)`)}
            </span>
          </button>
        </div>
      </div>

      {/* 5. Positions & Open Orders Section */}
      <div className="mt-6 px-4 flex flex-col gap-3">
        {/* Tab Bar */}
        <div className="flex items-center gap-4 bg-[#0d1c2d] px-4 py-2.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setBottomTab('positions')}
            className={`relative text-[13px] font-bold transition-colors ${
              bottomTab === 'positions' ? 'text-[#8083ff]' : 'text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            <span>پوزیشن‌های فعال ({positions.length})</span>
            {bottomTab === 'positions' && (
              <span className="absolute -bottom-2.5 inset-x-0 h-0.5 bg-[#8083ff] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setBottomTab('orders')}
            className={`relative text-[13px] font-bold transition-colors ${
              bottomTab === 'orders' ? 'text-[#8083ff]' : 'text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            <span>سفارش‌های باز ({orders.length})</span>
            {bottomTab === 'orders' && (
              <span className="absolute -bottom-2.5 inset-x-0 h-0.5 bg-[#8083ff] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setBottomTab('history')}
            className={`relative text-[13px] font-bold transition-colors ${
              bottomTab === 'history' ? 'text-[#8083ff]' : 'text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            <span>تاریخچه معاملات</span>
            {bottomTab === 'history' && (
              <span className="absolute -bottom-2.5 inset-x-0 h-0.5 bg-[#8083ff] rounded-full"></span>
            )}
          </button>
        </div>

        {/* TAB 1: POSITIONS LIST */}
        {bottomTab === 'positions' && (
          <div className="flex flex-col gap-3">
            {positions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0d1c2d] border border-white/5 text-center text-[#908fa0] text-[13px]">
                پوزیشن فعالی در حال حاضر وجود ندارد.
              </div>
            ) : (
              positions.map((pos) => {
                const isPos = pos.pnl >= 0;
                return (
                  <div
                    key={pos.id}
                    className="flex flex-col bg-[#122131] p-4 rounded-2xl border border-white/5 shadow-md gap-3"
                  >
                    {/* Position Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                            pos.type === 'LONG'
                              ? 'bg-[#00a572]/20 text-[#4edea3]'
                              : 'bg-[#ff516a]/20 text-[#ff516a]'
                          }`}
                        >
                          {pos.type === 'LONG' ? 'خرید Long' : 'فروش Short'} {pos.leverage}x
                        </span>
                        <span className="font-bold text-[15px] text-white">
                          {pos.symbol} پرپچوال
                        </span>
                      </div>
                      <button
                        onClick={() => closePosition(pos.id)}
                        className="px-3 py-1 rounded-xl bg-white/5 hover:bg-[#ff516a]/20 text-[#c7c4d7] hover:text-[#ff516a] text-[12px] font-bold active:scale-95 transition-all"
                      >
                        بستن سریع
                      </button>
                    </div>

                    {/* Live PnL & ROE */}
                    <div className="grid grid-cols-2 p-3 rounded-xl bg-[#051424] border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#908fa0]">سود و زیان تحقق‌نیافته (PnL)</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span
                            className={`font-mono text-[18px] font-black ${
                              isPos ? 'text-[#4edea3]' : 'text-[#ff516a]'
                            }`}
                            dir="ltr"
                          >
                            {isPos ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] text-[#908fa0]">نرخ بازدهی کل (ROE)</span>
                        <span
                          className={`font-mono text-[18px] font-black mt-0.5 ${
                            isPos ? 'text-[#4edea3]' : 'text-[#ff516a]'
                          }`}
                          dir="ltr"
                        >
                          {isPos ? `+${pos.roe}%` : `${pos.roe}%`}
                        </span>
                      </div>
                    </div>

                    {/* Operational Metrics Matrix */}
                    <div className="grid grid-cols-3 gap-2 text-[#908fa0] text-[11px] font-mono">
                      <div className="flex flex-col">
                        <span>اندازه پوزیشن:</span>
                        <span className="text-white font-bold mt-0.5">{pos.size} BTC</span>
                      </div>
                      <div className="flex flex-col">
                        <span>قیمت ورود:</span>
                        <span className="text-white font-bold mt-0.5">${pos.entryPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span>قیمت لیکوئید:</span>
                        <span className="text-amber-400 font-bold mt-0.5">${pos.liquidationPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Actions: TP/SL, Reverse, Share */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
                      <button
                        onClick={() => handleOpenTpSl(pos.id, pos.tp, pos.sl)}
                        className="py-1.5 rounded-xl bg-[#1c2b3c] hover:bg-[#273647] text-[#d4e4fa] text-[12px] font-medium flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">flag</span>
                        <span>TP / SL</span>
                      </button>
                      <button
                        onClick={() => reversePosition(pos.id)}
                        className="py-1.5 rounded-xl bg-[#1c2b3c] hover:bg-[#273647] text-[#d4e4fa] text-[12px] font-medium flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">autorenew</span>
                        <span>برعکس کردن</span>
                      </button>
                      <button
                        onClick={() => handleSharePnL(pos)}
                        className="py-1.5 rounded-xl bg-[#8083ff]/20 hover:bg-[#8083ff]/30 text-[#c0c1ff] text-[12px] font-medium flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">share</span>
                        <span>اشتراک سود</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: OPEN ORDERS */}
        {bottomTab === 'orders' && (
          <div className="flex flex-col gap-2">
            {orders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0d1c2d] border border-white/5 text-center text-[#908fa0] text-[13px]">
                سفارش بازی ثبت نشده است.
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-[#122131] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                        ord.side === 'BUY' ? 'bg-[#00a572]/20 text-[#4edea3]' : 'bg-[#ff516a]/20 text-[#ff516a]'
                      }`}
                    >
                      {ord.side === 'BUY' ? 'خرید' : 'فروش'} {ord.type}
                    </span>
                    <div className="flex flex-col font-mono text-[12px]">
                      <span className="font-bold text-white">{ord.symbol}</span>
                      <span className="text-[#908fa0]">
                        حجم: {ord.amount} • قیمت: ${ord.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelOrder(ord.id)}
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-[#ff516a]/20 text-[#908fa0] hover:text-[#ff516a] text-[11px] font-bold transition-colors"
                  >
                    لغو سفارش
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: TRADE HISTORY */}
        {bottomTab === 'history' && (
          <div className="p-4 rounded-2xl bg-[#0d1c2d] border border-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[12px] text-[#908fa0] border-b border-white/5 pb-2">
              <span>جفت‌ارز / زمان</span>
              <span>نوع</span>
              <span>قیمت / حجم</span>
              <span>وضعیت</span>
            </div>
            <div className="flex justify-between items-center text-[12px] font-mono py-1.5">
              <span>BTC/USDT • ۱۰:۱۵</span>
              <span className="text-[#4edea3] font-bold">BUY</span>
              <span>$67,215 (0.40)</span>
              <span className="text-[#4edea3]">تکمیل شد</span>
            </div>
            <div className="flex justify-between items-center text-[12px] font-mono py-1.5">
              <span>ETH/USDT • دیروز</span>
              <span className="text-[#ff516a] font-bold">SELL</span>
              <span>$3,390 (2.0)</span>
              <span className="text-[#4edea3]">تکمیل شد</span>
            </div>
          </div>
        )}
      </div>

      {/* TP/SL Adjustment Modal */}
      {tpSlModalPosId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#122131] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[15px] text-[#d4e4fa]">تنظیم حد سود (TP) و حد ضرر (SL)</h3>
              <button
                onClick={() => setTpSlModalPosId(null)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#908fa0]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] text-[#4edea3]">حد سود (Take Profit Price):</label>
                <input
                  type="number"
                  value={tpValue}
                  onChange={(e) => setTpValue(e.target.value)}
                  placeholder="مثال: 72000"
                  className="w-full bg-[#0d1c2d] border border-white/10 p-2.5 rounded-xl text-left font-mono font-bold text-white outline-none"
                  dir="ltr"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] text-[#ff516a]">حد ضرر (Stop Loss Price):</label>
                <input
                  type="number"
                  value={slValue}
                  onChange={(e) => setSlValue(e.target.value)}
                  placeholder="مثال: 66000"
                  className="w-full bg-[#0d1c2d] border border-white/10 p-2.5 rounded-xl text-left font-mono font-bold text-white outline-none"
                  dir="ltr"
                />
              </div>

              <button
                onClick={handleSaveTpSl}
                className="w-full py-2.5 rounded-xl bg-[#8083ff] text-[#051424] font-bold text-[13px] shadow mt-2"
              >
                ثبت سفارشات شرطی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
