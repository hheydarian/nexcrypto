import React, { useState, useMemo } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { TokenIcon } from './TokenIcon';

export const MarketsView: React.FC = () => {
  const {
    coins,
    favorites,
    toggleFavorite,
    setSelectedSymbol,
    setActiveTab,
    setPriceAlertModalOpen,
    isLiveApiConnected,
    lastUpdatedTime,
    isRefreshingPrices,
    refreshPrices,
  } = useExchange();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'volume' | 'price' | 'change' | 'name'>('volume');
  const [sortAsc, setSortAsc] = useState(false);

  const categories = [
    { id: 'all', label: 'همه بازارها' },
    { id: 'telegram', label: 'تلگرام و بازی‌ها (Telegram/Tap)' },
    { id: 'meme', label: 'میم‌کوین‌ها (Meme)' },
    { id: 'spot', label: 'اسپات (Spot)' },
    { id: 'futures', label: 'فیوچرز' },
    { id: 'trending', label: 'بیشترین رشد' },
    { id: 'ai', label: 'هوش مصنوعی (AI)' },
    { id: 'defi', label: 'دیفای (DeFi)' },
    { id: 'l1', label: 'لایه‌یک (L1)' },
  ];

  const filteredCoins = useMemo(() => {
    let list = coins.filter((coin) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        coin.symbol.toLowerCase().includes(q) ||
        coin.name.toLowerCase().includes(q) ||
        coin.nameFa.includes(q);

      const matchesCat =
        activeCategory === 'all'
          ? true
          : activeCategory === 'trending'
          ? coin.change24h > 5
          : coin.category.includes(activeCategory as any);

      const matchesFav = !favoritesOnly || favorites.includes(coin.symbol);

      return matchesQuery && matchesCat && matchesFav;
    });

    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'price') diff = a.price - b.price;
      else if (sortBy === 'change') diff = a.change24h - b.change24h;
      else if (sortBy === 'name') diff = a.symbol.localeCompare(b.symbol);
      else diff = parseFloat(b.volume24h) - parseFloat(a.volume24h);
      return sortAsc ? diff : -diff;
    });

    return list;
  }, [coins, searchQuery, activeCategory, favoritesOnly, favorites, sortBy, sortAsc]);

  const handleSelectCoin = (symbol: string) => {
    if (symbol === 'USDT') {
      setSelectedSymbol('USDT/TMN');
    } else {
      setSelectedSymbol(`${symbol}/USDT`);
    }
    setActiveTab('trade');
  };

  const handleToggleSort = (field: 'volume' | 'price' | 'change' | 'name') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-6 py-4 space-y-6 select-none">
      {/* 1. Top Market Pulse & Global Stats Bar */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4edea3] shadow-[0_0_10px_#4edea3] animate-ping"></div>
            <h2 className="text-[18px] md:text-[20px] font-bold text-[#d4e4fa] tracking-tight">
              دیده‌بان بازارها
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00a572]/15 border border-[#4edea3]/20 text-[11px] text-[#4edea3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
              <span>API قیمت‌های جهانی (KuCoin & CoinGecko)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshPrices}
              disabled={isRefreshingPrices}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1c2b3c] hover:bg-[#273647] border border-white/5 text-[11px] text-[#c7c4d7] transition-all"
            >
              <span className={`material-symbols-outlined text-[15px] text-[#8083ff] ${isRefreshingPrices ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>بروزرسانی:</span>
              <span className="font-mono text-[#d4e4fa]">{lastUpdatedTime}</span>
            </button>

            <div className="flex items-center gap-1 bg-[#1c2b3c] px-2.5 py-1 rounded-full border border-white/5 shadow-inner">
              <span className="material-symbols-outlined text-[15px] text-[#4edea3]">bolt</span>
              <span className="text-[11px] text-[#908fa0]">تأخیر:</span>
              <span className="font-mono text-[11px] text-[#4edea3] font-bold">14ms</span>
            </div>
          </div>
        </div>

        {/* Quick Search & Favorites Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center bg-[#010f1f] rounded-xl border border-white/10 shadow-inner">
            <span className="material-symbols-outlined absolute right-3 text-[#908fa0] text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام نماد، رمزارز یا آدرس..."
              className="w-full bg-transparent pr-10 pl-10 py-2.5 text-[#d4e4fa] placeholder-[#908fa0] text-[13px] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 text-[#908fa0] hover:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            title="فیلتر نشان‌شده‌ها"
            className={`flex items-center justify-center w-11 h-11 rounded-xl border transition-all ${
              favoritesOnly
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-[#122131] border-white/5 text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {favoritesOnly ? 'star' : 'star_border'}
            </span>
          </button>
        </div>
      </section>

      {/* 2. Horizontal Scrollable Segmented Filter Pills */}
      <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        <div className="flex items-center gap-1.5 w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#8083ff] text-[#051424] shadow-md shadow-[#8083ff]/30'
                  : 'bg-[#122131] text-[#908fa0] hover:bg-[#1c2b3c] hover:text-[#d4e4fa] border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Hot Coins Section: Tactile 3D Glass Cards */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-[#ff516a] animate-pulse">
              local_fire_department
            </span>
            <span className="text-[14px] font-bold text-[#d4e4fa]">کوین‌های داغ امروز</span>
          </div>
          <span className="text-[11px] font-mono text-[#908fa0]">بازنشانی در 04:12</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: RNDR */}
          <div
            onClick={() => handleSelectCoin('RNDR')}
            className="flex flex-col p-3 rounded-2xl bg-gradient-to-b from-[#1c2b3c] to-[#122131] border border-white/10 shadow-lg relative overflow-hidden group cursor-pointer hover:border-[#ff516a]/40 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <TokenIcon symbol="RNDR" size={28} />
              <span className="font-mono text-[10px] font-bold text-[#4edea3] bg-[#00a572]/20 px-1 rounded-full">
                +18.4%
              </span>
            </div>
            <span className="font-bold text-[14px] text-white">RNDR</span>
            <span className="text-[10px] text-[#908fa0]">Render</span>
            <span className="font-mono text-[13px] font-bold text-white mt-1">$11.45</span>
            {/* Sparkline */}
            <svg className="w-full h-6 mt-1.5 text-[#4edea3]" fill="none" viewBox="0 0 100 30">
              <path d="M0 25 Q 20 22, 35 15 T 65 18 T 100 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Card 2: SUI */}
          <div
            onClick={() => handleSelectCoin('SUI')}
            className="flex flex-col p-3 rounded-2xl bg-gradient-to-b from-[#1c2b3c] to-[#122131] border border-white/10 shadow-lg relative overflow-hidden group cursor-pointer hover:border-[#8083ff]/40 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <TokenIcon symbol="SUI" size={28} />
              <span className="font-mono text-[10px] font-bold text-[#4edea3] bg-[#00a572]/20 px-1 rounded-full">
                +14.2%
              </span>
            </div>
            <span className="font-bold text-[14px] text-white">SUI</span>
            <span className="text-[10px] text-[#908fa0]">Sui Network</span>
            <span className="font-mono text-[13px] font-bold text-white mt-1">$2.14</span>
            <svg className="w-full h-6 mt-1.5 text-[#4edea3]" fill="none" viewBox="0 0 100 30">
              <path d="M0 26 Q 25 24, 45 14 T 75 16 T 100 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Card 3: TAO */}
          <div
            onClick={() => handleSelectCoin('TAO')}
            className="flex flex-col p-3 rounded-2xl bg-gradient-to-b from-[#1c2b3c] to-[#122131] border border-white/10 shadow-lg relative overflow-hidden group cursor-pointer hover:border-[#4edea3]/40 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <TokenIcon symbol="TAO" size={28} />
              <span className="font-mono text-[10px] font-bold text-[#4edea3] bg-[#00a572]/20 px-1 rounded-full">
                +11.8%
              </span>
            </div>
            <span className="font-bold text-[14px] text-white">TAO</span>
            <span className="text-[10px] text-[#908fa0]">Bittensor</span>
            <span className="font-mono text-[13px] font-bold text-white mt-1">$582.0</span>
            <svg className="w-full h-6 mt-1.5 text-[#4edea3]" fill="none" viewBox="0 0 100 30">
              <path d="M0 28 Q 30 25, 50 12 T 80 14 T 100 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* 4. Comprehensive Markets Table Section */}
      <section className="flex flex-col gap-2">
        {/* Table Header with Sort Controls */}
        <div className="flex items-center justify-between text-[#908fa0] px-2 text-[11px] font-medium">
          <div
            onClick={() => handleToggleSort('name')}
            className="flex items-center gap-1 cursor-pointer hover:text-white"
          >
            <span>نام دارایی</span>
            <span className="material-symbols-outlined text-[14px]">unfold_more</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">روند ۲۴س</span>
            <div
              onClick={() => handleToggleSort('price')}
              className="flex items-center gap-1 cursor-pointer hover:text-white"
            >
              <span>آخرین قیمت / ۲۴س</span>
              <span className="material-symbols-outlined text-[14px]">
                {sortBy === 'price' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Rows */}
        <div className="flex flex-col gap-2">
          {filteredCoins.map((coin) => {
            const isFav = favorites.includes(coin.symbol);
            const isPos = coin.change24h >= 0;

            return (
              <div
                key={coin.symbol}
                onClick={() => handleSelectCoin(coin.symbol)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#122131]/80 hover:bg-[#1c2b3c] border border-white/5 hover:border-white/15 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(coin.symbol);
                    }}
                    className={`transition-colors ${
                      isFav ? 'text-amber-400' : 'text-[#908fa0] hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isFav ? 'star' : 'star_border'}
                    </span>
                  </button>

                  <TokenIcon symbol={coin.symbol} size={36} />

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[14px] text-white">{coin.symbol}</span>
                      <span className="text-[10px] font-mono text-[#908fa0] bg-[#1c2b3c] px-1 rounded">
                        10x
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#908fa0]">
                      <span>{coin.nameFa}</span>
                      <span>•</span>
                      <span className="font-mono">${coin.volume24h}</span>
                    </div>
                  </div>
                </div>

                {/* Trend line on desktop */}
                <div className="hidden sm:block w-20 h-6">
                  <svg
                    className={`w-full h-full fill-none ${isPos ? 'stroke-[#4edea3]' : 'stroke-[#ff516a]'}`}
                    viewBox="0 0 70 30"
                  >
                    <path
                      d={isPos ? 'M2 24 Q 20 25, 35 15 T 55 12 T 68 4' : 'M2 6 Q 22 8, 36 18 T 54 22 T 68 28'}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Price & Change badge */}
                <div className="flex flex-col items-end min-w-[85px]">
                  <span className="font-mono text-[14px] font-bold text-white">
                    ${coin.price.toLocaleString('en-US', { minimumFractionDigits: coin.decimals })}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                      isPos ? 'bg-[#00a572]/20 text-[#4edea3]' : 'bg-[#ff516a]/20 text-[#ff516a]'
                    }`}
                    dir="ltr"
                  >
                    {isPos ? `+${coin.change24h}%` : `${coin.change24h}%`}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredCoins.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 bg-[#122131] rounded-2xl text-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-[#8083ff]">travel_explore</span>
              <span className="font-bold text-[14px] text-white">نمادی یافت نشد!</span>
              <p className="text-[12px] text-[#908fa0]">عبارت جستجو را تغییر دهید یا فیلتر دیگری را انتخاب کنید.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Smart Price Alert Toast Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#1c2b3c] to-[#122131] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8083ff]/20 flex items-center justify-center text-[#c0c1ff]">
            <span className="material-symbols-outlined text-[22px]">notifications_active</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-white">هشدار قیمت هوشمند</span>
            <span className="text-[11px] text-[#908fa0]">اطلاع لحظه‌ای از نوسانات بالای ۳٪ بیت‌کوین و اتریوم</span>
          </div>
        </div>
        <button
          onClick={() => setPriceAlertModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#8083ff] text-[#051424] font-bold text-[12px] shadow hover:bg-[#c0c1ff] active:scale-95 transition-all"
        >
          تنظیم هشدار
        </button>
      </div>
    </div>
  );
};
