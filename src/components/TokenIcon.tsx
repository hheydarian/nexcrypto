import React from 'react';

interface TokenIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export const TokenIcon: React.FC<TokenIconProps> = ({ symbol, size = 36, className = '' }) => {
  const s = symbol.toUpperCase();

  switch (s) {
    case 'BTC':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0 bg-gradient-to-tr from-[#9B5300] via-[#F7931A] to-[#FFD188] border border-amber-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#f7931a] to-[#d67b09] flex items-center justify-center relative overflow-hidden">
            <div className="absolute -top-1 -left-1 w-2/3 h-2/3 bg-white/25 rounded-full blur-[2px] pointer-events-none"></div>
            <span className="font-bold text-white text-[16px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] font-mono">
              ₿
            </span>
          </div>
        </div>
      );

    case 'ETH':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0 bg-gradient-to-tr from-[#3b3dbb] via-[#6366f1] to-[#c0c1ff] border border-indigo-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#494bd6] to-[#1e2079] flex items-center justify-center relative overflow-hidden">
            <div className="absolute -top-1 -left-1 w-2/3 h-2/3 bg-white/20 rounded-full blur-[2px] pointer-events-none"></div>
            <svg className="w-4 h-4 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 12.5L12 16.5L20 12.5L12 2Z" fillOpacity="0.9" />
              <path d="M12 17.5L4 13.5L12 22L20 13.5L12 17.5Z" fillOpacity="0.75" />
            </svg>
          </div>
        </div>
      );

    case 'SOL':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-teal-500/25 flex-shrink-0 bg-gradient-to-tr from-[#00ffd5] via-[#8083ff] to-[#f43f5e] border border-emerald-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0c1825] to-[#172033] flex items-center justify-center relative overflow-hidden">
            <svg className="w-4 h-4 text-teal-300" viewBox="0 0 24 24" fill="none">
              <path d="M4 17.5h12.5l3.5-3.5H7.5L4 17.5z" fill="#00FFA3" />
              <path d="M7.5 13.5H20l-3.5-3.5H4l3.5 3.5z" fill="#00D2FF" />
              <path d="M4 9.5h12.5l3.5-3.5H7.5L4 9.5z" fill="#8083FF" />
            </svg>
          </div>
        </div>
      );

    case 'USDT':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0 bg-gradient-to-tr from-[#006041] via-[#26a17b] to-[#6ffbbe] border border-emerald-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#26a17b] to-[#12684e] flex items-center justify-center relative overflow-hidden">
            <div className="absolute -top-1 -left-1 w-2/3 h-2/3 bg-white/20 rounded-full blur-[2px] pointer-events-none"></div>
            <span className="font-bold text-white text-[17px] font-mono leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              ₮
            </span>
          </div>
        </div>
      );

    case 'TON':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0 bg-gradient-to-tr from-[#0070a3] via-[#0098ea] to-[#80d4ff] border border-cyan-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0098ea] to-[#005f93] flex items-center justify-center relative overflow-hidden">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L3.5 8L12 21L20.5 8L12 3ZM12 6.2L17.2 9.2L12 18.2L6.8 9.2L12 6.2Z" />
            </svg>
          </div>
        </div>
      );

    case 'XRP':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-slate-500/20 flex-shrink-0 bg-gradient-to-tr from-[#232936] via-[#46546d] to-[#9cb0d1] border border-slate-300/30 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1b2230] to-[#0e131c] flex items-center justify-center relative overflow-hidden">
            <span className="font-extrabold text-white text-[13px] tracking-wider font-mono">XRP</span>
          </div>
        </div>
      );

    case 'AVAX':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-rose-500/25 flex-shrink-0 bg-gradient-to-tr from-[#b81d2c] via-[#e84142] to-[#ffa1a2] border border-rose-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#e84142] to-[#8e111d] flex items-center justify-center relative overflow-hidden">
            <span className="font-extrabold text-white text-[14px]">▲</span>
          </div>
        </div>
      );

    case 'RNDR':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0 bg-gradient-to-tr from-[#94001b] via-[#ff3b5c] to-[#ffb2b7] border border-red-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2b080e] to-[#120205] flex items-center justify-center relative overflow-hidden">
            <span className="font-extrabold text-[#ff516a] text-[12px] font-mono">RNDR</span>
          </div>
        </div>
      );

    case 'SUI':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-sky-500/25 flex-shrink-0 bg-gradient-to-tr from-[#135f8d] via-[#4da2ff] to-[#b3d7ff] border border-sky-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0a2336] to-[#04121d] flex items-center justify-center relative overflow-hidden">
            <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
        </div>
      );

    case 'TAO':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0 bg-gradient-to-tr from-[#005e3f] via-[#4edea3] to-[#c0c1ff] border border-emerald-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0c2419] to-[#04120a] flex items-center justify-center relative overflow-hidden">
            <span className="font-bold text-[#4edea3] text-[12px] font-mono">τ</span>
          </div>
        </div>
      );

    case 'HMSTR':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0 bg-gradient-to-tr from-[#7c3a00] via-[#f59e0b] to-[#fef08a] border border-amber-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#b45309] to-[#78350f] flex items-center justify-center relative overflow-hidden">
            <span className="text-[16px] select-none">🐹</span>
          </div>
        </div>
      );

    case 'DOGS':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-neutral-500/30 flex-shrink-0 bg-gradient-to-tr from-[#171717] via-[#404040] to-[#f5f5f5] border border-white/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
            <span className="text-[16px] select-none">🐶</span>
          </div>
        </div>
      );

    case 'NOT':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-white/20 flex-shrink-0 bg-gradient-to-tr from-[#262626] via-[#525252] to-[#ffffff] border border-white/50 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-[#171717] flex items-center justify-center relative overflow-hidden">
            <span className="font-extrabold text-white text-[12px] font-mono tracking-tight">NOT</span>
          </div>
        </div>
      );

    case 'CATI':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-pink-500/25 flex-shrink-0 bg-gradient-to-tr from-[#9d174d] via-[#ec4899] to-[#fbcfe8] border border-pink-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#be185d] to-[#831843] flex items-center justify-center relative overflow-hidden">
            <span className="text-[16px] select-none">🐱</span>
          </div>
        </div>
      );

    case 'PEPE':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0 bg-gradient-to-tr from-[#14532d] via-[#22c55e] to-[#86efac] border border-emerald-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#15803d] to-[#14532d] flex items-center justify-center relative overflow-hidden">
            <span className="text-[16px] select-none">🐸</span>
          </div>
        </div>
      );

    case 'SHIB':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0 bg-gradient-to-tr from-[#c2410c] via-[#f97316] to-[#fdba74] border border-orange-300/40 p-0.5 ${className}`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#ea580c] to-[#9a3412] flex items-center justify-center relative overflow-hidden">
            <span className="text-[16px] select-none">🐕</span>
          </div>
        </div>
      );

    case 'NEX':
    case 'LOGO':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(128,131,255,0.4)] flex-shrink-0 bg-gradient-to-tr from-[#1a1c4b] via-[#2f327d] to-[#8083ff] border border-[#c0c1ff]/30 p-1 ${className}`}
        >
          <svg className="w-full h-full" viewBox="0 0 40 40" fill="none">
            <polygon points="20,4 35,12 35,28 20,36 5,28 5,12" stroke="#8083ff" strokeWidth="2.5" fill="#0d1428" />
            <polygon points="20,10 30,26 10,26" stroke="#4edea3" strokeWidth="2" fill="none" />
            <circle cx="20" cy="10" r="2.5" fill="#4edea3" />
            <circle cx="30" cy="26" r="2.5" fill="#c0c1ff" />
            <circle cx="10" cy="26" r="2.5" fill="#00d2ff" />
          </svg>
        </div>
      );

    default:
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-full flex items-center justify-center bg-surface-container-high border border-outline/30 text-on-surface font-bold text-[12px] font-mono flex-shrink-0 ${className}`}
        >
          {s.slice(0, 3)}
        </div>
      );
  }
};
