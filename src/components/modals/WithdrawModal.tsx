import React, { useState } from 'react';
import { useExchange } from '../../context/ExchangeContext';
import { TokenIcon } from '../TokenIcon';

export const WithdrawModal: React.FC = () => {
  const {
    withdrawModalOpen,
    setWithdrawModalOpen,
    coins,
    executeWithdraw,
    security,
  } = useExchange();

  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!withdrawModalOpen) return null;

  const currentCoin = coins.find((c) => c.symbol === selectedCoin) || coins[3];

  const networkFees: Record<string, number> = {
    TRC20: 1.0,
    ERC20: 4.5,
    BEP20: 0.8,
    Bitcoin: 0.0001,
    Solana: 0.005,
    TON: 0.05,
  };

  const currentFee = networkFees[network] || 1.0;
  const numAmount = parseFloat(amount) || 0;
  const netReceive = Math.max(0, numAmount - currentFee);

  const handleMax = () => {
    setAmount(currentCoin.balance.toString());
  };

  const selectWhitelistAddress = (addr: string) => {
    setAddress(addr);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (numAmount <= currentFee) {
      setErrorMsg(`مبلغ برداشت باید بیشتر از کارمزد شبکه (${currentFee}) باشد.`);
      return;
    }

    if (!address.trim()) {
      setErrorMsg('لطفاً آدرس کیف پول مقصد را وارد کنید.');
      return;
    }

    if (security.twoFactorEnabled && twoFactorCode.length < 6) {
      setErrorMsg('لطفاً کد ۶ رقمی تایید دو مرحله‌ای (Google Authenticator) را وارد کنید.');
      return;
    }

    const res = executeWithdraw(selectedCoin, numAmount, address, network);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setWithdrawModalOpen(false);
      }, 1800);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#122131] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0d1c2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ff516a]/20 flex items-center justify-center text-[#ff516a]">
              <span className="material-symbols-outlined text-[20px]">arrow_upward_alt</span>
            </div>
            <h3 className="font-bold text-[16px] text-[#d4e4fa]">برداشت از حساب</h3>
          </div>
          <button
            onClick={() => setWithdrawModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#908fa0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Coin Selector */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[12px] text-[#908fa0]">
              <span>ارز برداشتی</span>
              <span>
                موجودی قابل برداشت: <strong className="font-mono text-[#d4e4fa]">{currentCoin.balance.toLocaleString()} {currentCoin.symbol}</strong>
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
                      : 'bg-[#0d1c2d] border-white/5 text-[#908fa0] hover:text-[#d4e4fa]'
                  }`}
                >
                  <TokenIcon symbol={coin} size={18} />
                  <span className="text-[12px] font-mono">{coin}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Network Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#908fa0]">شبکه برداشت</label>
            <div className="grid grid-cols-3 gap-2">
              {['TRC20', 'ERC20', 'BEP20'].map((net) => (
                <button
                  type="button"
                  key={net}
                  onClick={() => setNetwork(net)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-mono border transition-all ${
                    network === net
                      ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3] font-bold'
                      : 'bg-[#0d1c2d] border-white/5 text-[#908fa0]'
                  }`}
                >
                  {net} (کارمزد: ${networkFees[net]})
                </button>
              ))}
            </div>
          </div>

          {/* Destination Address */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[12px]">
              <label className="text-[#908fa0]">آدرس مقصد</label>
              {security.addressWhitelistEnabled && (
                <span className="text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  لیست سفید فعال
                </span>
              )}
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="آدرس کیف پول مقصد را وارد کنید..."
              className="w-full bg-[#0d1c2d] border border-white/10 px-3 py-2 rounded-xl text-left font-mono text-[12px] text-[#d4e4fa] focus:border-[#8083ff] outline-none"
              dir="ltr"
            />

            {/* Quick Whitelist Pill Picker */}
            {security.whitelistAddresses.length > 0 && (
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[10px] text-[#908fa0]">انتخاب از آدرس‌های تایید شده شما:</span>
                <div className="flex flex-wrap gap-1.5">
                  {security.whitelistAddresses.map((wl) => (
                    <button
                      key={wl.id}
                      type="button"
                      onClick={() => selectWhitelistAddress(wl.address)}
                      className="px-2 py-1 rounded bg-[#1c2b3c] hover:bg-[#273647] text-[10px] text-[#c0c1ff] border border-white/5 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">bookmark</span>
                      <span>{wl.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#908fa0]">مبلغ برداشت</label>
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
                onClick={handleMax}
                className="absolute left-2 px-2 py-1 rounded bg-[#8083ff]/20 text-[#c0c1ff] text-[11px] font-bold hover:bg-[#8083ff]/30"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Fee & Net Calculation Breakdown */}
          <div className="p-3 rounded-xl bg-[#0d1c2d] border border-white/5 flex flex-col gap-1.5 text-[12px]">
            <div className="flex justify-between text-[#908fa0]">
              <span>کارمزد شبکه بلاکچین:</span>
              <span className="font-mono text-[#d4e4fa]">{currentFee} {selectedCoin}</span>
            </div>
            <div className="flex justify-between font-bold text-[#d4e4fa] border-t border-white/5 pt-1">
              <span>دریافتی نهایی در مقصد:</span>
              <span className="font-mono text-[#4edea3]">{netReceive.toFixed(currentCoin.decimals)} {selectedCoin}</span>
            </div>
          </div>

          {/* 2FA Prompt if enabled */}
          {security.twoFactorEnabled && (
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#1c2b3c] border border-white/10">
              <label className="text-[11px] text-[#c0c1ff] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                کد تایید دو مرحله‌ای (Google Authenticator)
              </label>
              <input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-[#0d1c2d] border border-white/10 px-3 py-2 rounded-lg text-center font-mono text-[16px] tracking-widest text-[#4edea3] outline-none"
              />
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-[#ff516a]/15 border border-[#ff516a]/30 text-[#ffb2b7] text-[12px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-lg bg-[#00a572]/20 border border-[#4edea3]/30 text-[#4edea3] text-[12px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action CTA */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#ff516a] hover:bg-[#ff3b5c] text-white font-bold text-[14px] shadow-lg shadow-[#ff516a]/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[20px]">lock_clock</span>
            <span>تأیید و ارسال درخواست برداشت</span>
          </button>
        </form>
      </div>
    </div>
  );
};
