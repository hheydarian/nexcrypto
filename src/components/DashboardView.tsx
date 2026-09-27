import React from 'react';
import { useExchange } from '../context/ExchangeContext';
import { TokenIcon } from './TokenIcon';

export const DashboardView: React.FC = () => {
  const {
    coins,
    totalPortfolioUsd,
    totalPortfolioToman,
    dailyProfitUsd,
    isBalanceHidden,
    toggleBalanceVisibility,
    currencyUnit,
    toggleCurrencyUnit,
    setActiveTab,
    setSelectedSymbol,
    setDepositModalOpen,
    setWithdrawModalOpen,
    setTransferModalOpen,
    setSecurityModalOpen,
    setDepositCoinDefault,
    tomanRate,
    formatTomanHuman,
  } = useExchange();

  const handleCoinClick = (symbol: string) => {
    if (symbol === 'USDT') {
      setSelectedSymbol('USDT/TMN');
      setActiveTab('trade');
    } else {
      setSelectedSymbol(`${symbol}/USDT`);
      setActiveTab('trade');
    }
  };

  const btcCoin = coins.find((c) => c.symbol === 'BTC') || coins[0];
  const ethCoin = coins.find((c) => c.symbol === 'ETH') || coins[1];
  const solCoin = coins.find((c) => c.symbol === 'SOL') || coins[2];
  const usdtCoin = coins.find((c) => c.symbol === 'USDT') || coins[3];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-6 py-4 space-y-6 select-none">
      {/* 1. Portfolio Total Card (Obsidian Kinetic Theme) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c2b3c] via-[#122131] to-[#0d1c2d] p-5 md:p-6 shadow-2xl border border-white/[0.08]">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#8083ff]/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-[#00a572]/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col space-y-4">
          {/* Header Row: Title + Privacy toggle + 24h gain pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#c7c4d7] font-medium">موجودی کل تخمینی</span>
              <button
                onClick={toggleBalanceVisibility}
                title={isBalanceHidden ? 'نمایش موجودی' : 'مخفی‌سازی موجودی'}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#c7c4d7] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {isBalanceHidden ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4edea3]/10 border border-[#4edea3]/20">
              <span className="material-symbols-outlined text-[#4edea3] text-[15px]">trending_up</span>
              <span className="font-mono text-[11px] font-bold text-[#4edea3]" dir="ltr">
                +5.84% (24h)
              </span>
            </div>
          </div>

          {/* Main Balance Display */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span
                onClick={toggleCurrencyUnit}
                className="font-mono text-[32px] md:text-[38px] font-black tracking-tight text-[#d4e4fa] cursor-pointer hover:text-white transition-colors"
                dir="ltr"
              >
                {isBalanceHidden
                  ? '••••••••'
                  : currencyUnit === 'USD'
                  ? `$${totalPortfolioUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `${totalPortfolioToman.toLocaleString('fa-IR')} تومان`}
              </span>
              <span className="text-[13px] text-[#c0c1ff] font-bold">
                {currencyUnit === 'USD' ? 'USD' : ''}
              </span>
            </div>

            {/* Equivalent value subtitle */}
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[12px] text-[#908fa0]">
              <span>معادل ریالی:</span>
              <span className="font-mono text-[#c7c4d7]">
                {isBalanceHidden ? '••••••••' : `≈ ${totalPortfolioToman.toLocaleString('fa-IR')} تومان`}
              </span>
              {!isBalanceHidden && (
                <span className="text-[#4edea3] font-bold">
                  ({formatTomanHuman(totalPortfolioToman)})
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics row */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
              <span className="text-[#c7c4d7]">سود خالص امروز:</span>
              <span className="font-mono font-bold text-[#4edea3]" dir="ltr">
                {isBalanceHidden ? '••••' : `+$${dailyProfitUsd.toLocaleString()}`}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('trade')}
              className="flex items-center gap-1 text-[#908fa0] hover:text-[#c0c1ff] transition-colors"
            >
              <span>گزارش سود و زیان پوزیشن‌ها</span>
              <span className="material-symbols-outlined text-[15px] rotate-180">arrow_right_alt</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions 4-Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Deposit */}
        <button
          onClick={() => {
            setDepositCoinDefault('USDT');
            setDepositModalOpen(true);
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#122131]/80 hover:bg-[#1c2b3c] border border-white/5 hover:border-white/10 transition-all duration-200 active:scale-95 group shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00a572] to-[#4edea3] flex items-center justify-center shadow-lg shadow-[#4edea3]/20 mb-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[#003824] text-[24px]">arrow_downward_alt</span>
          </div>
          <span className="text-[13px] font-bold text-[#d4e4fa]">واریز</span>
          <span className="text-[10px] text-[#908fa0] mt-0.5">آنی / کریپتو</span>
        </button>

        {/* Withdraw */}
        <button
          onClick={() => setWithdrawModalOpen(true)}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#122131]/80 hover:bg-[#1c2b3c] border border-white/5 hover:border-white/10 transition-all duration-200 active:scale-95 group shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#273647] to-[#464554] flex items-center justify-center shadow-lg shadow-black/30 mb-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[#d4e4fa] text-[24px]">arrow_upward_alt</span>
          </div>
          <span className="text-[13px] font-bold text-[#d4e4fa]">برداشت</span>
          <span className="text-[10px] text-[#908fa0] mt-0.5">شتاب / شبکه</span>
        </button>

        {/* Convert */}
        <button
          onClick={() => setActiveTab('swap-and-earn')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#122131]/80 hover:bg-[#1c2b3c] border border-white/5 hover:border-white/10 transition-all duration-200 active:scale-95 group shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#c0c1ff] to-[#8083ff] flex items-center justify-center shadow-lg shadow-[#8083ff]/25 mb-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[#0d0096] text-[24px]">currency_exchange</span>
          </div>
          <span className="text-[13px] font-bold text-[#d4e4fa]">تبدیل سریع</span>
          <span className="text-[10px] text-[#908fa0] mt-0.5">کارمزد صفر</span>
        </button>

        {/* Internal Transfer */}
        <button
          onClick={() => setTransferModalOpen(true)}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#122131]/80 hover:bg-[#1c2b3c] border border-white/5 hover:border-white/10 transition-all duration-200 active:scale-95 group shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#2c3a4c] to-[#273647] flex items-center justify-center shadow-lg shadow-black/20 mb-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[#c0c1ff] text-[24px]">sync_alt</span>
          </div>
          <span className="text-[13px] font-bold text-[#d4e4fa]">انتقال داخلی</span>
          <span className="text-[10px] text-[#908fa0] mt-0.5">کاربر به کاربر</span>
        </button>
      </div>

      {/* 3. Asset Allocation Donut Widget */}
      <div className="flex flex-col rounded-2xl bg-[#122131] border border-white/5 p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c0c1ff] text-[20px]">pie_chart</span>
            <span className="text-[15px] font-bold text-[#d4e4fa]">ترکیب سبد دارایی</span>
          </div>
          <span className="text-[12px] text-[#908fa0] font-mono">۴ دارایی فعال</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Donut Chart */}
          <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="38" stroke="#1c2b3c" strokeWidth="12" />
              {/* BTC: 52% */}
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#f7931a"
                strokeDasharray="124.15 238.76"
                strokeDashoffset="0"
                strokeWidth="12"
              />
              {/* ETH: 28% */}
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#8083ff"
                strokeDasharray="66.85 238.76"
                strokeDashoffset="-124.15"
                strokeWidth="12"
              />
              {/* SOL: 12% */}
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#14f195"
                strokeDasharray="28.65 238.76"
                strokeDashoffset="-191.0"
                strokeWidth="12"
              />
              {/* USDT: 8% */}
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#26a17b"
                strokeDasharray="19.1 238.76"
                strokeDashoffset="-219.65"
                strokeWidth="12"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-[#908fa0] uppercase tracking-wider">لیدر</span>
              <span className="font-mono text-[14px] font-bold text-[#d4e4fa]">BTC</span>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 gap-3 flex-1 w-full sm:pr-4">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0d1c2d] border border-white/5">
              <span className="w-3 h-3 rounded-full bg-[#f7931a] flex-shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#908fa0]">بیت‌کوین (BTC)</span>
                <span className="font-mono text-[13px] font-bold text-[#d4e4fa]">۵۲٪</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0d1c2d] border border-white/5">
              <span className="w-3 h-3 rounded-full bg-[#8083ff] flex-shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#908fa0]">اتریوم (ETH)</span>
                <span className="font-mono text-[13px] font-bold text-[#d4e4fa]">۲۸٪</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0d1c2d] border border-white/5">
              <span className="w-3 h-3 rounded-full bg-[#14f195] flex-shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#908fa0]">سولانا (SOL)</span>
                <span className="font-mono text-[13px] font-bold text-[#d4e4fa]">۱۲٪</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0d1c2d] border border-white/5">
              <span className="w-3 h-3 rounded-full bg-[#26a17b] flex-shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#908fa0]">تتر (USDT)</span>
                <span className="font-mono text-[13px] font-bold text-[#d4e4fa]">۸٪</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Campaign & Staking Banners Carousel */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#d4e4fa]">رویدادها و سود ویژه</span>
          <div className="flex items-center gap-1">
            <span className="w-4 h-1.5 rounded-full bg-[#8083ff]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#273647]"></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Banner 1: Trading Tournament */}
          <div
            onClick={() => setActiveTab('trade')}
            className="cursor-pointer relative rounded-2xl overflow-hidden bg-gradient-to-l from-[#1c2b3c] via-[#273647] to-[#122131] border border-white/10 p-4 shadow-lg flex items-center justify-between group hover:border-[#8083ff]/40 transition-all"
          >
            <div className="flex flex-col space-y-1 z-10 max-w-[70%]">
              <span className="px-2 py-0.5 rounded-full bg-[#4edea3]/15 text-[#4edea3] font-mono text-[10px] font-bold w-fit">
                جام معاملاتی بهاره
              </span>
              <span className="text-[15px] font-bold text-[#d4e4fa] leading-tight">
                ۱۰۰،۰۰۰ تتر جایزه نقدی
              </span>
              <span className="text-[11px] text-[#c7c4d7]">
                ثبت‌نام برای کلیه کاربران VIP رایگان است
              </span>
            </div>

            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 bg-[#8083ff]/20 rounded-full blur-md"></div>
              {/* Bespoke 3D trophy SVG */}
              <svg className="w-14 h-14 relative z-10 filter drop-shadow-[0_4px_10px_rgba(247,147,26,0.5)]" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="26" fill="url(#trophyGrad)" stroke="#FFD188" strokeWidth="1.5" />
                <path d="M22 20h20v10a10 10 0 01-20 0V20z" fill="#F7931A" />
                <path d="M18 22h4v6a2 2 0 01-2 2h-2v-8zM42 22h4v8h-2a2 2 0 01-2-2v-6z" fill="#FFA500" />
                <path d="M30 38h4v8h-4zM24 46h16v3H24z" fill="#FFD188" />
                <defs>
                  <linearGradient id="trophyGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2A1B0A" />
                    <stop offset="1" stopColor="#0B132B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Banner 2: Flexible Staking */}
          <div
            onClick={() => setActiveTab('swap-and-earn')}
            className="cursor-pointer relative rounded-2xl overflow-hidden bg-gradient-to-l from-[#1c2b3c] via-[#273647] to-[#122131] border border-white/10 p-4 shadow-lg flex items-center justify-between group hover:border-[#4edea3]/40 transition-all"
          >
            <div className="flex flex-col space-y-1 z-10 max-w-[70%]">
              <span className="px-2 py-0.5 rounded-full bg-[#8083ff]/15 text-[#c0c1ff] font-mono text-[10px] font-bold w-fit">
                استیکینگ منعطف
              </span>
              <span className="text-[15px] font-bold text-[#d4e4fa] leading-tight">
                اتریوم با ۱۲.۸٪ سود سالانه
              </span>
              <span className="text-[11px] text-[#c7c4d7]">
                واریز پاداش به صورت روزانه به کیف پول
              </span>
            </div>

            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 bg-[#4edea3]/20 rounded-full blur-md"></div>
              {/* Bespoke 3D Ethereum Prism SVG */}
              <svg className="w-14 h-14 relative z-10 filter drop-shadow-[0_4px_12px_rgba(128,131,255,0.6)]" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="26" fill="#0c1626" stroke="#8083ff" strokeWidth="1.5" />
                <path d="M32 14L20 34L32 41L44 34L32 14Z" fill="url(#ethTop)" />
                <path d="M32 43L20 36L32 52L44 36L32 43Z" fill="#494BD6" />
                <defs>
                  <linearGradient id="ethTop" x1="20" y1="14" x2="44" y2="41" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#C0C1FF" />
                    <stop offset="1" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Assets List Section */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">account_balance</span>
            <span className="text-[15px] font-bold text-[#d4e4fa]">دارایی‌های شما</span>
          </div>
          <button
            onClick={() => setActiveTab('markets')}
            className="text-[12px] text-[#c0c1ff] hover:underline flex items-center gap-0.5"
          >
            <span>دیدن همه بازارها</span>
            <span className="material-symbols-outlined text-[15px] rotate-180">chevron_left</span>
          </button>
        </div>

        {/* Coin Items List */}
        <div className="flex flex-col space-y-2">
          {/* Bitcoin (BTC) */}
          <div
            onClick={() => handleCoinClick('BTC')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#122131]/70 hover:bg-[#1c2b3c] border border-white/5 hover:border-white/15 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <TokenIcon symbol="BTC" size={42} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-[#d4e4fa]">بیت‌کوین</span>
                  <span className="text-[11px] font-mono text-[#908fa0] uppercase">BTC</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-mono text-[#c7c4d7]">${btcCoin.price.toLocaleString()}</span>
                  <span className="font-mono font-bold text-[#4edea3] bg-[#00a572]/20 px-1 rounded">
                    +{btcCoin.change24h}%
                  </span>
                </div>
              </div>
            </div>

            {/* Sparkline SVG */}
            <div className="hidden sm:block w-20 h-7">
              <svg className="w-full h-full stroke-[#4edea3] fill-none" viewBox="0 0 60 24">
                <path d="M 0 18 Q 15 22 25 12 T 45 8 T 60 2" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>

            {/* Balances */}
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="font-mono text-[14px] font-bold text-[#d4e4fa]">
                {isBalanceHidden ? '••••' : `${btcCoin.balance} BTC`}
              </span>
              <span className="font-mono text-[11px] text-[#908fa0]">
                {isBalanceHidden ? '••••' : `$${(btcCoin.balance * btcCoin.price).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              </span>
            </div>
          </div>

          {/* Ethereum (ETH) */}
          <div
            onClick={() => handleCoinClick('ETH')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#122131]/70 hover:bg-[#1c2b3c] border border-white/5 hover:border-white/15 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <TokenIcon symbol="ETH" size={42} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-[#d4e4fa]">اتریوم</span>
                  <span className="text-[11px] font-mono text-[#908fa0] uppercase">ETH</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-mono text-[#c7c4d7]">${ethCoin.price.toLocaleString()}</span>
                  <span className="font-mono font-bold text-[#4edea3] bg-[#00a572]/20 px-1 rounded">
                    +{ethCoin.change24h}%
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block w-20 h-7">
              <svg className="w-full h-full stroke-[#4edea3] fill-none" viewBox="0 0 60 24">
                <path d="M 0 20 Q 20 18 30 10 T 50 6 T 60 1" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              <span className="font-mono text-[14px] font-bold text-[#d4e4fa]">
                {isBalanceHidden ? '••••' : `${ethCoin.balance} ETH`}
              </span>
              <span className="font-mono text-[11px] text-[#908fa0]">
                {isBalanceHidden ? '••••' : `$${(ethCoin.balance * ethCoin.price).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              </span>
            </div>
          </div>

          {/* Solana (SOL) */}
          <div
            onClick={() => handleCoinClick('SOL')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#122131]/70 hover:bg-[#1c2b3c] border border-white/5 hover:border-white/15 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <TokenIcon symbol="SOL" size={42} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-[#d4e4fa]">سولانا</span>
                  <span className="text-[11px] font-mono text-[#908fa0] uppercase">SOL</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-mono text-[#c7c4d7]">${solCoin.price.toLocaleString()}</span>
                  <span className="font-mono font-bold text-[#4edea3] bg-[#00a572]/20 px-1 rounded">
                    +{solCoin.change24h}%
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block w-20 h-7">
              <svg className="w-full h-full stroke-[#4edea3] fill-none" viewBox="0 0 60 24">
                <path d="M 0 22 Q 10 20 25 15 T 45 4 T 60 2" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              <span className="font-mono text-[14px] font-bold text-[#d4e4fa]">
                {isBalanceHidden ? '••••' : `${solCoin.balance} SOL`}
              </span>
              <span className="font-mono text-[11px] text-[#908fa0]">
                {isBalanceHidden ? '••••' : `$${(solCoin.balance * solCoin.price).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              </span>
            </div>
          </div>

          {/* Tether (USDT) */}
          <div
            onClick={() => handleCoinClick('USDT')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#122131]/70 hover:bg-[#1c2b3c] border border-white/5 hover:border-white/15 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <TokenIcon symbol="USDT" size={42} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-[#d4e4fa]">تتر</span>
                  <span className="text-[11px] font-mono text-[#908fa0] uppercase">USDT</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-mono text-[#c7c4d7]">$1.00</span>
                  <span className="font-mono text-[#908fa0]">ثابت (استیبل‌کوین)</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block w-20 h-7">
              <svg className="w-full h-full stroke-[#908fa0] fill-none" viewBox="0 0 60 24">
                <path d="M 0 12 L 60 12" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              <span className="font-mono text-[14px] font-bold text-[#d4e4fa]">
                {isBalanceHidden ? '••••' : `${usdtCoin.balance.toLocaleString()} USDT`}
              </span>
              <span className="font-mono text-[11px] text-[#908fa0]">
                {isBalanceHidden ? '••••' : `$${usdtCoin.balance.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Security Multi-Layer Cold Storage Banner */}
      <div
        onClick={() => setSecurityModalOpen(true)}
        className="p-4 rounded-2xl bg-[#0d1c2d] border border-white/10 hover:border-[#4edea3]/40 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00a572]/20 flex items-center justify-center text-[#4edea3]">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-[#d4e4fa] leading-tight">
              امنیت چندلایه فعال است
            </span>
            <span className="text-[11px] text-[#908fa0] mt-0.5">
              خزانه سرد چندامضایی (Cold Storage) و حفاظت در برابر فیشینگ
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#4edea3] font-bold">
          <span>تنظیمات</span>
          <span className="material-symbols-outlined text-[18px] rotate-180">chevron_left</span>
        </div>
      </div>
    </div>
  );
};
