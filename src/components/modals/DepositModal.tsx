import React, { useState } from 'react';
import { useExchange } from '../../context/ExchangeContext';
import { TokenIcon } from '../TokenIcon';

export const DepositModal: React.FC = () => {
  const { depositModalOpen, setDepositModalOpen, coins, executeDeposit, depositCoinDefault } = useExchange();
  const [selectedCoin, setSelectedCoin] = useState(depositCoinDefault || 'USDT');
  const [network, setNetwork] = useState('TRC20');
  const [simAmount, setSimAmount] = useState('500');
  const [copied, setCopied] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  if (!depositModalOpen) return null;

  const currentCoin = coins.find((c) => c.symbol === selectedCoin) || coins[3];

  const addresses: Record<string, Record<string, string>> = {
    USDT: {
      TRC20: 'TYDzsYUEWzPpxf7DTWJGrDE97zkpxbhVv3',
      ERC20: '0x71C8366420A092679b54718357290C7c2C5d24d1',
      BEP20: '0x71C8366420A092679b54718357290C7c2C5d24d1',
    },
    BTC: {
      Bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      Lightning: 'lnbc100u1pn...',
    },
    ETH: {
      ERC20: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
      Arbitrum: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    },
    SOL: {
      Solana: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    },
    TON: {
      TON: 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N',
    },
  };

  const currentAddress =
    addresses[selectedCoin]?.[network] ||
    addresses[selectedCoin]?.[Object.keys(addresses[selectedCoin] || {})[0]] ||
    '0x71C8366420A092679b54718357290C7c2C5d24d1';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeposit = () => {
    const val = parseFloat(simAmount);
    if (!isNaN(val) && val > 0) {
      executeDeposit(selectedCoin, val, network);
      setDepositSuccess(true);
      setTimeout(() => {
        setDepositSuccess(false);
        setDepositModalOpen(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#122131] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0d1c2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00a572]/20 flex items-center justify-center text-[#4edea3]">
              <span className="material-symbols-outlined text-[20px]">arrow_downward_alt</span>
            </div>
            <h3 className="font-bold text-[16px] text-[#d4e4fa]">واریز ارز دیجیتال</h3>
          </div>
          <button
            onClick={() => setDepositModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#908fa0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Coin Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#908fa0]">انتخاب رمزارز</label>
            <div className="grid grid-cols-4 gap-2">
              {['USDT', 'BTC', 'ETH', 'SOL'].map((coin) => (
                <button
                  key={coin}
                  onClick={() => {
                    setSelectedCoin(coin);
                    setNetwork(Object.keys(addresses[coin] || {})[0] || 'Mainnet');
                  }}
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

          {/* Network Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#908fa0]">شبکه انتقال (Network)</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(addresses[selectedCoin] || { Standard: '' }).map((net) => (
                <button
                  key={net}
                  onClick={() => setNetwork(net)}
                  className={`py-1.5 px-3 rounded-lg text-[12px] font-mono border transition-all ${
                    network === net
                      ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3] font-bold'
                      : 'bg-[#0d1c2d] border-white/5 text-[#908fa0] hover:text-[#d4e4fa]'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          {/* QR Code & Address Display */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#0d1c2d] rounded-xl border border-white/5 gap-3">
            <div className="w-36 h-36 bg-white rounded-xl p-2.5 flex items-center justify-center shadow-lg relative">
              {/* Clean SVG QR code representation */}
              <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                <rect x="0" y="0" width="30" height="30" rx="3" fill="#000" />
                <rect x="4" y="4" width="22" height="22" rx="2" fill="#fff" />
                <rect x="8" y="8" width="14" height="14" rx="1" fill="#000" />
                <rect x="70" y="0" width="30" height="30" rx="3" fill="#000" />
                <rect x="74" y="4" width="22" height="22" rx="2" fill="#fff" />
                <rect x="78" y="8" width="14" height="14" rx="1" fill="#000" />
                <rect x="0" y="70" width="30" height="30" rx="3" fill="#000" />
                <rect x="4" y="74" width="22" height="22" rx="2" fill="#fff" />
                <rect x="8" y="78" width="14" height="14" rx="1" fill="#000" />
                <rect x="40" y="10" width="10" height="10" fill="#000" />
                <rect x="55" y="10" width="10" height="10" fill="#000" />
                <rect x="40" y="40" width="20" height="20" rx="4" fill="#6366f1" />
                <rect x="10" y="40" width="10" height="10" fill="#000" />
                <rect x="70" y="40" width="10" height="10" fill="#000" />
                <rect x="40" y="70" width="10" height="10" fill="#000" />
                <rect x="70" y="70" width="20" height="20" fill="#000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <TokenIcon symbol={selectedCoin} size={24} />
              </div>
            </div>

            <div className="flex flex-col items-center w-full">
              <span className="text-[11px] text-[#908fa0] mb-1">آدرس اختصاصی واریز شما:</span>
              <div className="flex items-center justify-between w-full bg-[#051424] px-3 py-2 rounded-lg border border-white/10">
                <span className="font-mono text-[11px] text-[#c0c1ff] truncate dir-ltr select-all" dir="ltr">
                  {currentAddress}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#4edea3] hover:underline mr-2"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'کپی شد' : 'کپی'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Warnings & Security Note */}
          <div className="p-3 rounded-xl bg-[#ffb4ab]/10 border border-[#ff516a]/20 flex items-start gap-2">
            <span className="material-symbols-outlined text-[#ff516a] text-[18px] mt-0.5">warning</span>
            <div className="flex flex-col text-[11px] text-[#ffdad6] leading-relaxed">
              <span>فقط رمزارز <strong>{selectedCoin}</strong> را روی شبکه <strong>{network}</strong> ارسال فرمایید.</span>
              <span>حداقل واریز: ۵ دلار. واریز مبالغ کمتر قابل بازیابی نیست.</span>
            </div>
          </div>

          {/* Realistic Test Deposit Simulator Box */}
          <div className="p-3 rounded-xl bg-[#1c2b3c] border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#c0c1ff]">شارژ مستقیم / واریز آزمایشی</span>
              <span className="text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded-full font-bold">
                تایید آنی بلاکچین
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                className="flex-1 bg-[#0d1c2d] border border-white/10 px-3 py-2 rounded-lg text-left font-mono font-bold text-[#d4e4fa] outline-none"
                placeholder="مقدار واریز"
                dir="ltr"
              />
              <span className="text-[12px] font-bold font-mono text-[#908fa0]">{selectedCoin}</span>
            </div>
            <button
              onClick={handleSimulateDeposit}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#00a572] to-[#4edea3] text-[#002113] font-bold text-[13px] shadow-lg shadow-[#4edea3]/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              {depositSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>موجودی با موفقیت شارژ شد!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>تأیید و ثبت واریز آنی</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
