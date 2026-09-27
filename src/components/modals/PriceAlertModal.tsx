import React, { useState } from 'react';
import { useExchange } from '../../context/ExchangeContext';
import { TokenIcon } from '../TokenIcon';

export const PriceAlertModal: React.FC = () => {
  const { priceAlertModalOpen, setPriceAlertModalOpen, coins, addNotification } = useExchange();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [saved, setSaved] = useState(false);

  if (!priceAlertModalOpen) return null;

  const currentCoin = coins.find((c) => c.symbol === selectedSymbol) || coins[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(targetPrice);
    if (!isNaN(p) && p > 0) {
      addNotification(
        'هشدار قیمت هوشمند فعال شد',
        `هشدار نوسان برای ${currentCoin.nameFa} (${currentCoin.symbol}) در صورت ${
          direction === 'above' ? 'عبور از بالای' : 'افت به زیر'
        } $${p.toLocaleString()} تنظیم شد.`,
        'ALERT'
      );
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setPriceAlertModalOpen(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#122131] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0d1c2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8083ff]/20 flex items-center justify-center text-[#c0c1ff]">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            </div>
            <h3 className="font-bold text-[15px] text-[#d4e4fa]">تنظیم هشدار قیمت هوشمند</h3>
          </div>
          <button
            onClick={() => setPriceAlertModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#908fa0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-[#908fa0]">انتخاب دارایی:</label>
            <select
              value={selectedSymbol}
              onChange={(e) => {
                setSelectedSymbol(e.target.value);
                const c = coins.find((coin) => coin.symbol === e.target.value);
                if (c) setTargetPrice((c.price * 1.05).toFixed(c.decimals));
              }}
              className="bg-[#0d1c2d] border border-white/10 p-2.5 rounded-xl text-[13px] text-[#d4e4fa] outline-none"
            >
              {coins.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.nameFa} ({c.symbol}) - ${c.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDirection('above')}
              className={`py-2 rounded-xl text-[12px] font-bold border transition-all ${
                direction === 'above'
                  ? 'bg-[#00a572]/20 border-[#4edea3] text-[#4edea3]'
                  : 'bg-[#0d1c2d] border-white/5 text-[#908fa0]'
              }`}
            >
              عبور به بالاتر از ▲
            </button>
            <button
              type="button"
              onClick={() => setDirection('below')}
              className={`py-2 rounded-xl text-[12px] font-bold border transition-all ${
                direction === 'below'
                  ? 'bg-[#ff516a]/20 border-[#ff516a] text-[#ff516a]'
                  : 'bg-[#0d1c2d] border-white/5 text-[#908fa0]'
              }`}
            >
              افت به پایین‌تر از ▼
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[12px] text-[#908fa0]">
              <span>قیمت هدف (دلار):</span>
              <span>قیمت فعلی: <strong className="font-mono text-[#d4e4fa]">${currentCoin.price.toLocaleString()}</strong></span>
            </div>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="مثال: 70000"
              className="w-full bg-[#0d1c2d] border border-white/10 p-2.5 rounded-xl text-left font-mono font-bold text-[#d4e4fa] outline-none"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#8083ff] text-[#051424] font-bold text-[13px] shadow-lg shadow-[#8083ff]/25 active:scale-98 transition-all flex items-center justify-center gap-1"
          >
            {saved ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>هشدار با موفقیت ذخیره شد!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">add_alert</span>
                <span>فعال‌سازی هشدار آنی</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
