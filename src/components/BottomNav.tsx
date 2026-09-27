import React from 'react';
import { useExchange } from '../context/ExchangeContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useExchange();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#010f1f]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.6)] md:hidden">
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        {/* 1. Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
            activeTab === 'dashboard' ? 'text-[#c0c1ff] font-bold' : 'text-[#c7c4d7]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
          <span className="text-[11px] leading-tight">داشبورد</span>
        </button>

        {/* 2. Markets */}
        <button
          onClick={() => setActiveTab('markets')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
            activeTab === 'markets' ? 'text-[#c0c1ff] font-bold' : 'text-[#c7c4d7]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">monitoring</span>
          <span className="text-[11px] leading-tight">بازارها</span>
        </button>

        {/* 3. Trade (Center Hero Action) */}
        <button
          onClick={() => setActiveTab('trade')}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 relative group"
        >
          <div
            className={`w-11 h-11 -mt-6 rounded-full flex items-center justify-center transition-all duration-300 ${
              activeTab === 'trade'
                ? 'bg-gradient-to-tr from-[#6366f1] to-[#8083ff] text-[#051424] shadow-[0_0_20px_rgba(128,131,255,0.7)] scale-105'
                : 'bg-[#1c2b3c] text-[#c0c1ff] shadow-[0_4px_12px_rgba(0,0,0,0.4)] group-hover:scale-105'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">candlestick_chart</span>
          </div>
          <span
            className={`text-[11px] mt-0.5 ${
              activeTab === 'trade' ? 'text-[#c0c1ff] font-bold' : 'text-[#c7c4d7]'
            }`}
          >
            معامله
          </span>
        </button>

        {/* 4. Swap & Earn */}
        <button
          onClick={() => setActiveTab('swap-and-earn')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
            activeTab === 'swap-and-earn' ? 'text-[#c0c1ff] font-bold' : 'text-[#c7c4d7]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">swap_calls</span>
          <span className="text-[11px] leading-tight">تبدیل و سود</span>
        </button>
      </div>
    </nav>
  );
};
