import React, { useState } from 'react';
import { useExchange } from '../../context/ExchangeContext';
import { StakingPool } from '../../types/crypto';
import { TokenIcon } from '../TokenIcon';

interface StakeModalProps {
  pool: StakingPool | null;
  onClose: () => void;
}

export const StakeModal: React.FC<StakeModalProps> = ({ pool, onClose }) => {
  const { coins, executeStake, executeUnstake } = useExchange();
  const [mode, setMode] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  if (!pool) return null;

  const coin = coins.find((c) => c.symbol === pool.token);
  const availableBal = coin ? coin.balance : 0;
  const numAmount = parseFloat(amount) || 0;

  // Calculations
  const dailyYield = (numAmount * (pool.apy / 100)) / 365;
  const yearlyYield = numAmount * (pool.apy / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (numAmount <= 0) {
      setFeedback({ type: 'error', msg: 'لطفاً مبلغ معتبری وارد فرمایید.' });
      return;
    }

    if (mode === 'stake') {
      if (numAmount < pool.minDeposit) {
        setFeedback({ type: 'error', msg: `حداقل مبلغ استیکینگ ${pool.minDeposit} ${pool.token} است.` });
        return;
      }
      const res = executeStake(pool.id, numAmount);
      if (res.success) {
        setFeedback({ type: 'success', msg: res.message });
        setTimeout(onClose, 1500);
      } else {
        setFeedback({ type: 'error', msg: res.message });
      }
    } else {
      const res = executeUnstake(pool.id, numAmount);
      if (res.success) {
        setFeedback({ type: 'success', msg: res.message });
        setTimeout(onClose, 1500);
      } else {
        setFeedback({ type: 'error', msg: res.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#122131] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0d1c2d]">
          <div className="flex items-center gap-2">
            <TokenIcon symbol={pool.token} size={28} />
            <div>
              <h3 className="font-bold text-[16px] text-[#d4e4fa]">{pool.nameFa}</h3>
              <p className="text-[11px] text-[#908fa0]">{pool.period}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#908fa0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab switch (Stake / Unstake) */}
        <div className="grid grid-cols-2 p-1 m-4 mb-0 bg-[#0d1c2d] rounded-xl border border-white/5">
          <button
            onClick={() => setMode('stake')}
            className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
              mode === 'stake' ? 'bg-[#8083ff] text-[#051424] shadow' : 'text-[#908fa0]'
            }`}
          >
            سپرده‌گذاری (Stake)
          </button>
          <button
            onClick={() => setMode('unstake')}
            className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
              mode === 'unstake' ? 'bg-[#8083ff] text-[#051424] shadow' : 'text-[#908fa0]'
            }`}
          >
            برداشت سرمایه (Unstake)
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* APY Highlight Strip */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00a572]/15 to-[#122131] border border-[#4edea3]/25 flex items-center justify-between">
            <span className="text-[12px] text-[#908fa0]">نرخ بازدهی سالانه (APY):</span>
            <span className="font-mono text-[20px] font-extrabold text-[#4edea3]" dir="ltr">
              {pool.apy}%
            </span>
          </div>

          {/* Amount input */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[12px] text-[#908fa0]">
              <span>مبلغ مورد نظر:</span>
              <span>
                {mode === 'stake' ? 'موجودی کیف پول:' : 'موجودی استیک شده:'}{' '}
                <strong className="font-mono text-[#d4e4fa]">
                  {mode === 'stake' ? availableBal.toLocaleString() : pool.userStaked.toLocaleString()} {pool.token}
                </strong>
              </span>
            </div>
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
                onClick={() =>
                  setAmount(mode === 'stake' ? availableBal.toString() : pool.userStaked.toString())
                }
                className="absolute left-2 px-2 py-1 rounded bg-[#8083ff]/20 text-[#c0c1ff] text-[11px] font-bold"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Calculator preview */}
          {mode === 'stake' && numAmount > 0 && (
            <div className="p-3 rounded-xl bg-[#0d1c2d] border border-white/5 flex flex-col gap-1.5 text-[12px]">
              <div className="flex justify-between text-[#908fa0]">
                <span>سود تخمینی روزانه:</span>
                <span className="font-mono text-[#4edea3]">
                  +{dailyYield.toFixed(5)} {pool.token}
                </span>
              </div>
              <div className="flex justify-between text-[#908fa0]">
                <span>سود تخمینی یک‌ساله:</span>
                <span className="font-mono text-[#4edea3] font-bold">
                  +{yearlyYield.toFixed(4)} {pool.token}
                </span>
              </div>
            </div>
          )}

          {feedback && (
            <div
              className={`p-2.5 rounded-lg text-[12px] flex items-center gap-1.5 ${
                feedback.type === 'error'
                  ? 'bg-[#ff516a]/15 border border-[#ff516a]/30 text-[#ffb2b7]'
                  : 'bg-[#00a572]/20 border border-[#4edea3]/30 text-[#4edea3]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {feedback.type === 'error' ? 'error' : 'check_circle'}
              </span>
              <span>{feedback.msg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00a572] to-[#4edea3] text-[#002113] font-bold text-[14px] shadow-lg shadow-[#4edea3]/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mode === 'stake' ? 'savings' : 'currency_exchange'}
            </span>
            <span>{mode === 'stake' ? 'تأیید و آغاز استیکینگ' : 'تأیید برداشت به کیف پول'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
