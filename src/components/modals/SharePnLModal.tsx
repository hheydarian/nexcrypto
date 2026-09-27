import React, { useState } from 'react';
import { useExchange } from '../../context/ExchangeContext';
import { TokenIcon } from '../TokenIcon';

export const SharePnLModal: React.FC = () => {
  const { sharePnlModalOpen, setSharePnlModalOpen, sharePnlPosition } = useExchange();
  const [copied, setCopied] = useState(false);

  if (!sharePnlModalOpen || !sharePnlPosition) return null;

  const pos = sharePnlPosition;
  const isPositive = pos.pnl >= 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://nexcrypto.exchange/ref/trader-vip3?pnl=${pos.roe}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm flex flex-col gap-3">
        {/* Close Button */}
        <button
          onClick={() => setSharePnlModalOpen(false)}
          className="self-end w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* 3D Visual Share Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c2b3c] via-[#0d1c2d] to-[#010f1f] border border-white/15 p-6 shadow-2xl flex flex-col gap-4">
          {/* Ambient Glows */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#8083ff]/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#4edea3]/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Top Brand & Pair */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <TokenIcon symbol="LOGO" size={28} />
              <div className="flex flex-col">
                <span className="font-bold text-[14px] text-[#c0c1ff] tracking-tight">NexCrypto</span>
                <span className="text-[9px] text-[#908fa0] uppercase tracking-wider font-mono">Futures Pro</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#122131] border border-white/10">
              <span className={`text-[11px] font-bold font-mono ${pos.type === 'LONG' ? 'text-[#4edea3]' : 'text-[#ff516a]'}`}>
                {pos.type} {pos.leverage}x
              </span>
            </div>
          </div>

          {/* Main ROE % Display */}
          <div className="flex flex-col py-2 relative z-10">
            <span className="text-[12px] text-[#908fa0] font-medium">بازدهی کل (ROE):</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={`font-mono text-[36px] font-black tracking-tight ${
                  isPositive ? 'text-[#4edea3] drop-shadow-[0_0_15px_rgba(78,222,163,0.4)]' : 'text-[#ff516a]'
                }`}
                dir="ltr"
              >
                {isPositive ? `+${pos.roe}%` : `${pos.roe}%`}
              </span>
            </div>
            <span className="text-[12px] font-mono text-[#d4e4fa]" dir="ltr">
              PnL: {isPositive ? `+$${pos.pnl.toLocaleString()}` : `-$${Math.abs(pos.pnl).toLocaleString()}`} USDT
            </span>
          </div>

          {/* Price Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#051424]/80 border border-white/5 relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#908fa0]">قیمت ورود:</span>
              <span className="font-mono text-[13px] font-bold text-[#d4e4fa] mt-0.5" dir="ltr">
                ${pos.entryPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-[#908fa0]">قیمت مارک:</span>
              <span className="font-mono text-[13px] font-bold text-[#4edea3] mt-0.5" dir="ltr">
                ${pos.markPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer with Mini QR & Referral */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#d4e4fa]">معامله کنید، سود ببرید</span>
              <span className="text-[10px] text-[#908fa0]">کد رفرال: VIP-TRADER-99</span>
            </div>
            {/* Mini vector QR */}
            <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center shadow">
              <svg className="w-full h-full text-black" viewBox="0 0 40 40" fill="currentColor">
                <rect x="0" y="0" width="14" height="14" rx="2" />
                <rect x="2" y="2" width="10" height="10" rx="1" fill="#fff" />
                <rect x="4" y="4" width="6" height="6" fill="#000" />
                <rect x="26" y="0" width="14" height="14" rx="2" />
                <rect x="28" y="2" width="10" height="10" rx="1" fill="#fff" />
                <rect x="30" y="4" width="6" height="6" fill="#000" />
                <rect x="0" y="26" width="14" height="14" rx="2" />
                <rect x="2" y="28" width="10" height="10" rx="1" fill="#fff" />
                <rect x="4" y="30" width="6" height="6" fill="#000" />
                <rect x="18" y="18" width="6" height="6" fill="#6366f1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 rounded-xl bg-[#8083ff] text-[#051424] font-bold text-[12px] flex items-center justify-center gap-1.5 shadow-lg active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'share'}
            </span>
            <span>{copied ? 'لینک اشتراک کپی شد!' : 'کپی لینک اشتراک کارت'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
