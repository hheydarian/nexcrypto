import React, { useState } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { TokenIcon } from './TokenIcon';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currencyUnit,
    toggleCurrencyUnit,
    notifications,
    setNotificationDrawerOpen,
    setSecurityModalOpen,
    isLiveApiConnected,
    isRefreshingPrices,
    refreshPrices,
  } = useExchange();

  const [network, setNetwork] = useState<'Mainnet' | 'Testnet'>('Mainnet');
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const viewTitles = {
    dashboard: 'داشبورد',
    markets: 'دیده‌بان بازارها',
    trade: 'ترمینال معامله',
    'swap-and-earn': 'تبدیل و سود',
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#051424]/90 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
      <div className="max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
          >
            <TokenIcon symbol="LOGO" size={34} />
            <div className="flex flex-col">
              <span className="font-bold text-[18px] tracking-tight text-[#c0c1ff] leading-none">
                NexCrypto
              </span>
              <span className="text-[11px] text-[#908fa0] font-medium mt-0.5">
                {viewTitles[activeTab]}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 mr-6 border-r border-white/10 pr-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#8083ff]/15 text-[#c0c1ff] font-semibold'
                  : 'text-[#908fa0] hover:text-[#d4e4fa] hover:bg-white/5'
              }`}
            >
              داشبورد
            </button>
            <button
              onClick={() => setActiveTab('markets')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'markets'
                  ? 'bg-[#8083ff]/15 text-[#c0c1ff] font-semibold'
                  : 'text-[#908fa0] hover:text-[#d4e4fa] hover:bg-white/5'
              }`}
            >
              بازارها
            </button>
            <button
              onClick={() => setActiveTab('trade')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'trade'
                  ? 'bg-[#8083ff]/15 text-[#c0c1ff] font-semibold'
                  : 'text-[#908fa0] hover:text-[#d4e4fa] hover:bg-white/5'
              }`}
            >
              معامله (Futures)
            </button>
            <button
              onClick={() => setActiveTab('swap-and-earn')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'swap-and-earn'
                  ? 'bg-[#8083ff]/15 text-[#c0c1ff] font-semibold'
                  : 'text-[#908fa0] hover:text-[#d4e4fa] hover:bg-white/5'
              }`}
            >
              تبدیل و سود (Earn)
            </button>
          </nav>
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Live API Pulse & Sync Button */}
          <button
            onClick={refreshPrices}
            disabled={isRefreshingPrices}
            title="بروزرسانی زنده قیمت‌ها از KuCoin و CoinGecko"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] border border-white/5 text-[11px] font-mono text-[#d4e4fa] transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveApiConnected ? 'bg-[#4edea3] shadow-[0_0_8px_#4edea3]' : 'bg-amber-400'
              } ${isRefreshingPrices ? 'animate-ping' : ''}`}
            ></span>
            <span className="text-[11px] font-sans text-[#c7c4d7]">قیمت زنده</span>
            <span className={`material-symbols-outlined text-[14px] text-[#8083ff] ${isRefreshingPrices ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          {/* Currency Toggle (USD <-> Toman) */}
          <button
            onClick={toggleCurrencyUnit}
            title="تغییر واحد ارزی (دلار / تومان)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] border border-white/5 text-[11px] font-bold text-[#c0c1ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">currency_exchange</span>
            <span>{currencyUnit === 'USD' ? 'USD' : 'تومان'}</span>
          </button>

          {/* Network Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c2b3c] border border-white/5 hover:border-white/15 transition-all"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${network === 'Mainnet' ? 'bg-[#4edea3] animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-[11px] font-mono font-semibold text-[#4edea3]">
                {network}
              </span>
              <span className="material-symbols-outlined text-[14px] text-[#908fa0]">expand_more</span>
            </button>

            {networkDropdownOpen && (
              <div className="absolute left-0 mt-1 w-32 py-1 bg-[#122131] border border-white/10 rounded-xl shadow-2xl z-50">
                <button
                  onClick={() => {
                    setNetwork('Mainnet');
                    setNetworkDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-right text-[12px] hover:bg-white/5 flex items-center justify-between text-[#d4e4fa]"
                >
                  <span>Mainnet</span>
                  {network === 'Mainnet' && <span className="material-symbols-outlined text-[14px] text-[#4edea3]">check</span>}
                </button>
                <button
                  onClick={() => {
                    setNetwork('Testnet');
                    setNetworkDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-right text-[12px] hover:bg-white/5 flex items-center justify-between text-[#d4e4fa]"
                >
                  <span>Testnet Sepolia</span>
                  {network === 'Testnet' && <span className="material-symbols-outlined text-[14px] text-amber-400">check</span>}
                </button>
              </div>
            )}
          </div>

          {/* Security Center Shortcut */}
          <button
            onClick={() => setSecurityModalOpen(true)}
            title="مرکز امنیت سازمانی"
            className="w-8 h-8 rounded-full bg-[#122131] hover:bg-[#1c2b3c] border border-white/5 flex items-center justify-center text-[#4edea3] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">shield</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setNotificationDrawerOpen(true)}
            title="اعلان‌ها و رویدادها"
            className="relative w-8 h-8 rounded-full bg-[#122131] hover:bg-[#1c2b3c] border border-white/5 flex items-center justify-center text-[#c7c4d7] hover:text-[#d4e4fa] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#ff516a] text-white text-[9px] font-bold flex items-center justify-center border-2 border-[#051424]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* VIP Profile Avatar */}
          <div
            onClick={() => setSecurityModalOpen(true)}
            className="relative flex items-center justify-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8083ff] to-[#4edea3] p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#0d1c2d] flex items-center justify-center text-[#c0c1ff] font-bold text-[12px]">
                NX
              </div>
            </div>
            <span className="absolute -bottom-1 -left-1 px-1 rounded-full bg-[#8083ff] text-[#0d0096] text-[8px] font-mono font-bold scale-90 shadow">
              VIP 3
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
