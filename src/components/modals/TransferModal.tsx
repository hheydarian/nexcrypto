import React, { useState } from 'react';
import { useExchange } from '../../context/ExchangeContext';
import { TokenIcon } from '../TokenIcon';

export const TransferModal: React.FC = () => {
  const { transferModalOpen, setTransferModalOpen, coins, executeInternalTransfer } = useExchange();
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!transferModalOpen) return null;

  const currentCoin = coins.find((c) => c.symbol === selectedCoin) || coins[3];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const num = parseFloat(amount);

    if (!recipient.trim()) {
      setStatusMsg({ type: 'error', text: 'لطفاً شناسه کاربری (UID) یا ایمیل مقصد را وارد کنید.' });
      return;
    }

    if (isNaN(num) || num <= 0) {
      setStatusMsg({ type: 'error', text: 'لطفاً مبلغ معتبری را وارد کنید.' });
      return;
    }

    const res = executeInternalTransfer(selectedCoin, num, recipient.trim());
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setTransferModalOpen(false);
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#122131] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0d1c2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8083ff]/20 flex items-center justify-center text-[#c0c1ff]">
              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
            </div>
            <h3 className="font-bold text-[16px] text-[#d4e4fa]">انتقال داخلی بین‌کاربری</h3>
          </div>
          <button
            onClick={() => setTransferModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#908fa0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="p-3 rounded-xl bg-[#00a572]/15 border border-[#4edea3]/25 flex items-center gap-2 text-[12px] text-[#4edea3]">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>انتقال داخلی بین کاربران NexCrypto آنی و با <strong>کارمزد صفر</strong> انجام می‌شود.</span>
          </div>

          {/* Recipient Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#908fa0]">شناسه UID کاربر یا ایمیل</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="مثال: NX-94812 یا user@mail.com"
              className="w-full bg-[#0d1c2d] border border-white/10 px-3 py-2.5 rounded-xl text-[13px] text-[#d4e4fa] focus:border-[#8083ff] outline-none"
            />
          </div>

          {/* Coin Selector */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[12px] text-[#908fa0]">
              <span>انتخاب دارایی</span>
              <span>
                موجودی: <strong className="font-mono text-[#d4e4fa]">{currentCoin.balance.toLocaleString()} {currentCoin.symbol}</strong>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {['USDT', 'BTC', 'ETH', 'SOL'].map((coin) => (
                <button
                  type="button"
                  key={coin}
                  onClick={() => setSelectedCoin(coin)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl border transition-all ${
                    selectedCoin === coin
                      ? 'bg-[#8083ff]/20 border-[#8083ff] text-[#c0c1ff] font-bold'
                      : 'bg-[#0d1c2d] border-white/5 text-[#908fa0]'
                  }`}
                >
                  <TokenIcon symbol={coin} size={18} />
                  <span className="text-[12px] font-mono">{coin}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#908fa0]">مبلغ انتقال</label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0d1c2d] border border-white/10 pr-3 pl-16 py-2.5 rounded-xl text-left font-mono font-bold text-[#d4e4fa] focus:border-[#8083ff] outline-none"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setAmount(currentCoin.balance.toString())}
                className="absolute left-2 px-2 py-1 rounded bg-[#8083ff]/20 text-[#c0c1ff] text-[11px] font-bold"
              >
                MAX
              </button>
            </div>
          </div>

          {statusMsg && (
            <div
              className={`p-2.5 rounded-lg text-[12px] flex items-center gap-1.5 ${
                statusMsg.type === 'error'
                  ? 'bg-[#ff516a]/15 border border-[#ff516a]/30 text-[#ffb2b7]'
                  : 'bg-[#00a572]/20 border border-[#4edea3]/30 text-[#4edea3]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {statusMsg.type === 'error' ? 'error' : 'check_circle'}
              </span>
              <span>{statusMsg.text}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8083ff] text-[#051424] font-bold text-[14px] shadow-lg shadow-[#8083ff]/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            <span>ارسال آنی وجه</span>
          </button>
        </form>
      </div>
    </div>
  );
};
