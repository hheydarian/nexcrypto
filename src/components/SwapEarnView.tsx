import React, { useState } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { TokenIcon } from './TokenIcon';
import { StakeModal } from './modals/StakeModal';
import { StakingPool } from '../types/crypto';

export const SwapEarnView: React.FC = () => {
  const { coins, executeSwap, stakingPools } = useExchange();

  const [activeMode, setActiveMode] = useState<'swap' | 'earn'>('swap');
  const [sourceCoin, setSourceCoin] = useState('USDT');
  const [targetCoin, setTargetCoin] = useState('BTC');
  const [sourceAmount, setSourceAmount] = useState('1000');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [swapError, setSwapError] = useState('');

  // Selected pool for modal
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);

  const fromCoin = coins.find((c) => c.symbol === sourceCoin) || coins[3];
  const toCoin = coins.find((c) => c.symbol === targetCoin) || coins[0];

  // Calculation
  const numSource = parseFloat(sourceAmount) || 0;
  const usdValue = numSource * fromCoin.price;
  const targetAmount = toCoin.price > 0 ? (usdValue / toCoin.price).toFixed(toCoin.decimals > 2 ? 6 : 4) : '0.00';
  const targetUsd = usdValue * 0.9998;

  const handleMax = () => {
    setSourceAmount(fromCoin.balance.toString());
  };

  const flipCurrencies = () => {
    const temp = sourceCoin;
    setSourceCoin(targetCoin);
    setTargetCoin(temp);
  };

  const handleExecuteSwap = () => {
    setSwapError('');
    if (numSource <= 0) {
      setSwapError('لطفاً مبلغی برای تبدیل وارد کنید.');
      return;
    }
    if (fromCoin.balance < numSource) {
      setSwapError(`موجودی ${fromCoin.symbol} شما کافی نیست.`);
      return;
    }

    setIsSwapping(true);
    setTimeout(() => {
      const res = executeSwap(sourceCoin, targetCoin, numSource);
      setIsSwapping(false);
      if (res.success) {
        setSwapSuccess(true);
        setTimeout(() => setSwapSuccess(false), 2500);
      } else {
        setSwapError(res.message);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-6 py-4 space-y-6 select-none">
      {/* 1. Segmented Top Tabs */}
      <div className="w-full p-1 rounded-2xl bg-[#0d1c2d] border border-white/5 flex items-center shadow-inner">
        <button
          onClick={() => setActiveMode('swap')}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-[13px] transition-all duration-300 ${
            activeMode === 'swap'
              ? 'bg-[#8083ff] text-[#051424] shadow-lg shadow-[#8083ff]/30'
              : 'text-[#908fa0] hover:text-[#d4e4fa]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
          <span>تبدیل سریع (Swap)</span>
        </button>

        <button
          onClick={() => setActiveMode('earn')}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-[13px] transition-all duration-300 ${
            activeMode === 'earn'
              ? 'bg-[#8083ff] text-[#051424] shadow-lg shadow-[#8083ff]/30'
              : 'text-[#908fa0] hover:text-[#d4e4fa]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">savings</span>
          <span>سپرده‌گذاری و سود (Earn)</span>
          <span className="px-2 py-0.5 rounded-full bg-[#00a572]/20 text-[#4edea3] text-[10px] font-mono font-bold">
            APY+
          </span>
        </button>
      </div>

      {/* 2. SWAP SECTION */}
      {activeMode === 'swap' && (
        <section className="flex flex-col gap-4">
          <div className="p-5 md:p-6 rounded-2xl bg-[#122131] border border-white/10 shadow-2xl flex flex-col gap-3 relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-[#8083ff]/10 blur-3xl pointer-events-none"></div>

            {/* Source Asset (Pay) */}
            <div className="p-4 rounded-2xl bg-[#051424] border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[#908fa0] text-[12px]">
                <span>پرداخت می‌کنید</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span>موجودی:</span>
                  <span className="text-[#d4e4fa] font-bold">
                    {fromCoin.balance.toLocaleString()} {fromCoin.symbol}
                  </span>
                  <button
                    onClick={handleMax}
                    className="px-2 py-0.5 rounded bg-[#8083ff]/20 text-[#c0c1ff] font-bold hover:bg-[#8083ff]/30"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mt-1">
                <input
                  type="number"
                  value={sourceAmount}
                  onChange={(e) => setSourceAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent font-mono text-[24px] md:text-[28px] text-white font-bold outline-none text-left"
                  dir="ltr"
                />

                <select
                  value={sourceCoin}
                  onChange={(e) => setSourceCoin(e.target.value)}
                  className="bg-[#1c2b3c] border border-white/10 px-3 py-2 rounded-xl text-[14px] font-bold font-mono text-white outline-none cursor-pointer"
                >
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                  <option value="TON">TON</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#908fa0] font-mono">
                <span>≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                <span>شبکه رسمی بلاکچین</span>
              </div>
            </div>

            {/* Inverted Switch Button (3D Neon Floating) */}
            <div className="relative flex items-center justify-center -my-3 z-10">
              <button
                onClick={flipCurrencies}
                title="تغییر جهت تبدیل"
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#8083ff] text-[#051424] flex items-center justify-center shadow-[0_0_20px_rgba(128,131,255,0.6)] active:scale-90 transition-transform duration-200"
              >
                <span className="material-symbols-outlined text-[22px]">swap_vert</span>
              </button>
            </div>

            {/* Destination Asset (Receive) */}
            <div className="p-4 rounded-2xl bg-[#051424] border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[#908fa0] text-[12px]">
                <span>دریافت تخمینی</span>
                <div className="flex items-center gap-1 text-[#4edea3] text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-ping"></span>
                  <span>بهترین نرخ بازار (Smart Liquidity)</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mt-1">
                <input
                  type="text"
                  readOnly
                  value={targetAmount}
                  className="w-full bg-transparent font-mono text-[24px] md:text-[28px] text-[#4edea3] font-bold outline-none text-left"
                  dir="ltr"
                />

                <select
                  value={targetCoin}
                  onChange={(e) => setTargetCoin(e.target.value)}
                  className="bg-[#1c2b3c] border border-white/10 px-3 py-2 rounded-xl text-[14px] font-bold font-mono text-white outline-none cursor-pointer"
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                  <option value="USDT">USDT</option>
                  <option value="TON">TON</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#908fa0] font-mono">
                <span>≈ ${targetUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                <span className="text-[#4edea3] font-bold">بدون اسلیپیج منفی</span>
              </div>
            </div>

            {/* Meta Routing Details */}
            <div className="p-3.5 rounded-xl bg-[#0d1c2d] border border-white/5 flex flex-col gap-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#908fa0]">نرخ زنده تبدیل:</span>
                <span className="font-mono text-[#d4e4fa]" dir="ltr">
                  1 {fromCoin.symbol} ≈ {(fromCoin.price / (toCoin.price || 1)).toFixed(toCoin.decimals > 2 ? 6 : 4)} {toCoin.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#908fa0]">مسیر بهینه (Smart Router):</span>
                <span className="flex items-center gap-1 font-mono text-[#c0c1ff]">
                  <span>NexRouter + Uniswap V3</span>
                  <span className="material-symbols-outlined text-[14px]">alt_route</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#908fa0]">کارمزد پلتفرم NexCrypto:</span>
                <span className="px-2 py-0.5 rounded bg-[#00a572]/20 text-[#4edea3] font-bold font-mono">
                  $0.00 (رایگان)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#908fa0]">حداکثر اسلیپیج مجاز:</span>
                <span className="font-mono text-[#d4e4fa]">0.10%</span>
              </div>
            </div>

            {swapError && (
              <div className="p-2.5 rounded-lg bg-[#ff516a]/15 border border-[#ff516a]/30 text-[#ffb2b7] text-[12px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{swapError}</span>
              </div>
            )}

            {/* Swap CTA */}
            <button
              onClick={handleExecuteSwap}
              disabled={isSwapping}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#8083ff] to-[#c0c1ff] text-[#051424] font-bold text-[14px] shadow-lg shadow-[#8083ff]/30 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isSwapping ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  <span>در حال مسیریابی و تبدیل آنی...</span>
                </>
              ) : swapSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[20px] text-[#003824]">check_circle</span>
                  <span className="text-[#003824]">تبدیل با موفقیت انجام شد!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                  <span>تبدیل فوری و آنی {fromCoin.symbol} به {toCoin.symbol}</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* 3. EARN & STAKING VAULTS SECTION */}
      {activeMode === 'earn' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse"></div>
              <h2 className="text-[17px] font-bold text-[#d4e4fa]">صندوق‌های سوددهی پربازده</h2>
            </div>
            <span className="text-[12px] text-[#908fa0]">پاداش خودکار روزانه</span>
          </div>

          <div className="flex flex-col gap-3">
            {stakingPools.map((pool) => (
              <div
                key={pool.id}
                className="p-5 rounded-2xl bg-[#122131] border border-white/10 shadow-lg flex flex-col gap-3 relative overflow-hidden group hover:border-[#8083ff]/40 transition-all"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <TokenIcon symbol={pool.token} size={42} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-white">{pool.nameFa}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#1c2b3c] font-mono text-[11px] text-[#c0c1ff]">
                          {pool.token}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#908fa0] mt-0.5">{pool.period}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[11px] text-[#908fa0]">بازده سالانه (APY)</span>
                    <span className="font-mono text-[22px] font-black text-[#4edea3]" dir="ltr">
                      {pool.apy}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#051424] border border-white/5 text-[11px] font-mono">
                  <div className="flex flex-col">
                    <span className="text-[#908fa0]">سرمایه قفل شده (TVL):</span>
                    <span className="text-[#d4e4fa] font-bold mt-0.5">{pool.totalLocked}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[#908fa0]">پاداش تخمینی روزانه:</span>
                    <span className="text-[#4edea3] font-bold mt-0.5">{pool.dailyRewardPerUnit}</span>
                  </div>
                </div>

                {pool.userStaked > 0 && (
                  <div className="flex justify-between items-center px-3 py-2 rounded-xl bg-[#00a572]/15 border border-[#4edea3]/20 text-[12px]">
                    <span className="text-[#908fa0]">موجودی استیک شده شما:</span>
                    <span className="font-mono text-[#4edea3] font-bold">
                      {pool.userStaked} {pool.token} (پاداش تجمیعی: +{pool.accruedReward})
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setSelectedPool(pool)}
                  className="w-full py-2.5 rounded-xl bg-[#00a572] hover:bg-[#4edea3] text-[#002113] font-bold text-[13px] shadow-md shadow-[#4edea3]/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>{pool.userStaked > 0 ? 'مدیریت و واریز بیشتر' : `شروع استیکینگ ${pool.token}`}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stake Modal */}
      {selectedPool && (
        <StakeModal pool={selectedPool} onClose={() => setSelectedPool(null)} />
      )}
    </div>
  );
};
