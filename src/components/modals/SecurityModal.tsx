import React, { useState } from 'react';
import { useExchange } from '../../context/ExchangeContext';

export const SecurityModal: React.FC = () => {
  const { securityModalOpen, setSecurityModalOpen, security, updateSecurity } = useExchange();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | '2fa' | 'whitelist' | 'sessions'>('overview');

  // 2FA local state
  const [twoFactorInput, setTwoFactorInput] = useState('');
  const [twoFactorFeedback, setTwoFactorFeedback] = useState('');

  // Anti-phishing edit
  const [editingPhishing, setEditingPhishing] = useState(false);
  const [phishingCode, setPhishingCode] = useState(security.antiPhishingCode);

  // Add whitelist address state
  const [showAddWl, setShowAddWl] = useState(false);
  const [newWlCoin, setNewWlCoin] = useState('USDT');
  const [newWlNet, setNewWlNet] = useState('TRC20');
  const [newWlLabel, setNewWlLabel] = useState('');
  const [newWlAddr, setNewWlAddr] = useState('');

  if (!securityModalOpen) return null;

  const handleToggle2FA = () => {
    if (!security.twoFactorEnabled) {
      if (twoFactorInput.length !== 6) {
        setTwoFactorFeedback('لطفاً کد ۶ رقمی را برای فعال‌سازی وارد کنید.');
        return;
      }
      updateSecurity({ twoFactorEnabled: true });
      setTwoFactorFeedback('تایید دو مرحله‌ای با موفقیت فعال شد!');
      setTimeout(() => setTwoFactorFeedback(''), 2000);
    } else {
      updateSecurity({ twoFactorEnabled: false });
      setTwoFactorFeedback('تایید دو مرحله‌ای غیرفعال شد.');
      setTimeout(() => setTwoFactorFeedback(''), 2000);
    }
  };

  const handleSavePhishing = () => {
    if (phishingCode.trim()) {
      updateSecurity({ antiPhishingCode: phishingCode.trim() });
      setEditingPhishing(false);
    }
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWlLabel || !newWlAddr) return;

    const newItem = {
      id: `wl-${Date.now()}`,
      coin: newWlCoin,
      network: newWlNet,
      label: newWlLabel,
      address: newWlAddr,
      createdAt: new Date().toISOString().split('T')[0],
    };

    updateSecurity({
      whitelistAddresses: [...security.whitelistAddresses, newItem],
    });

    setNewWlLabel('');
    setNewWlAddr('');
    setShowAddWl(false);
  };

  const handleDeleteWhitelist = (id: string) => {
    updateSecurity({
      whitelistAddresses: security.whitelistAddresses.filter((w) => w.id !== id),
    });
  };

  const handleTerminateOtherSessions = () => {
    const current = security.activeSessions.filter((s) => s.isCurrent);
    updateSecurity({ activeSessions: current });
  };

  const handleToggleFreeze = () => {
    updateSecurity({ isAccountFrozen: !security.isAccountFrozen });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#122131] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0d1c2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00a572]/20 flex items-center justify-center text-[#4edea3]">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#d4e4fa]">مرکز امنیت سازمانی NexCrypto</h3>
              <p className="text-[11px] text-[#908fa0]">پروتکل‌های پیشرفته حفاظت از دارایی و هویت</p>
            </div>
          </div>
          <button
            onClick={() => setSecurityModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#908fa0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-white/5 bg-[#0d1c2d] px-4">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`py-2.5 px-3 text-[12px] font-bold border-b-2 transition-all ${
              activeSubTab === 'overview'
                ? 'border-[#8083ff] text-[#c0c1ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            نمای کلی
          </button>
          <button
            onClick={() => setActiveSubTab('2fa')}
            className={`py-2.5 px-3 text-[12px] font-bold border-b-2 transition-all ${
              activeSubTab === '2fa'
                ? 'border-[#8083ff] text-[#c0c1ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            تایید دو مرحله‌ای (2FA)
          </button>
          <button
            onClick={() => setActiveSubTab('whitelist')}
            className={`py-2.5 px-3 text-[12px] font-bold border-b-2 transition-all ${
              activeSubTab === 'whitelist'
                ? 'border-[#8083ff] text-[#c0c1ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            لیست سفید آدرس‌ها
          </button>
          <button
            onClick={() => setActiveSubTab('sessions')}
            className={`py-2.5 px-3 text-[12px] font-bold border-b-2 transition-all ${
              activeSubTab === 'sessions'
                ? 'border-[#8083ff] text-[#c0c1ff]'
                : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            دستگاه‌ها و نشست‌ها
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="flex flex-col gap-3">
              {/* Cold storage banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00a572]/20 to-[#122131] border border-[#4edea3]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#4edea3]/20 flex items-center justify-center text-[#4edea3]">
                    <span className="material-symbols-outlined text-[24px]">vpn_key</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#d4e4fa]">کیف پول سرد چندامضایی (Cold Storage)</span>
                    <span className="text-[11px] text-[#908fa0]">۹۸.۴٪ دارایی‌ها در خزانه‌های آفلاین ایزوله نگهداری می‌شوند</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold font-mono text-[#4edea3] bg-[#4edea3]/10 px-2 py-1 rounded-full">
                  فعال / امن
                </span>
              </div>

              {/* Status matrix */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0d1c2d] border border-white/5 flex flex-col gap-1">
                  <span className="text-[11px] text-[#908fa0]">تایید دو مرحله‌ای (2FA)</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[12px] font-bold ${security.twoFactorEnabled ? 'text-[#4edea3]' : 'text-amber-400'}`}>
                      {security.twoFactorEnabled ? 'فعال است' : 'غیرفعال (توصیه به فعال‌سازی)'}
                    </span>
                    <button
                      onClick={() => setActiveSubTab('2fa')}
                      className="text-[11px] text-[#c0c1ff] underline"
                    >
                      تنظیم
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0d1c2d] border border-white/5 flex flex-col gap-1">
                  <span className="text-[11px] text-[#908fa0]">لیست سفید برداشت</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[12px] font-bold ${security.addressWhitelistEnabled ? 'text-[#4edea3]' : 'text-[#908fa0]'}`}>
                      {security.addressWhitelistEnabled ? 'فعال (حفاظت شدید)' : 'غیرفعال'}
                    </span>
                    <button
                      onClick={() => setActiveSubTab('whitelist')}
                      className="text-[11px] text-[#c0c1ff] underline"
                    >
                      مدیریت
                    </button>
                  </div>
                </div>
              </div>

              {/* Anti-phishing code section */}
              <div className="p-3.5 rounded-xl bg-[#0d1c2d] border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#8083ff]">mark_email_read</span>
                    <span className="text-[13px] font-bold text-[#d4e4fa]">کد ضد فیشینگ (Anti-Phishing)</span>
                  </div>
                  <button
                    onClick={() => setEditingPhishing(!editingPhishing)}
                    className="text-[11px] text-[#c0c1ff] hover:underline"
                  >
                    {editingPhishing ? 'انصراف' : 'تغییر کد'}
                  </button>
                </div>
                <p className="text-[11px] text-[#908fa0]">
                  این عبارت اختصاصی در تمامی پیام‌های سیستمی و ایمیل‌های NexCrypto درج می‌شود تا جعلی بودن پیام‌ها بلافاصله شناسایی گردد.
                </p>
                {editingPhishing ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={phishingCode}
                      onChange={(e) => setPhishingCode(e.target.value)}
                      className="flex-1 bg-[#051424] border border-white/10 px-3 py-1.5 rounded-lg font-mono text-[12px] text-[#d4e4fa] outline-none"
                    />
                    <button
                      onClick={handleSavePhishing}
                      className="px-3 py-1.5 rounded-lg bg-[#8083ff] text-[#051424] font-bold text-[12px]"
                    >
                      ذخیره
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-[#051424] px-3 py-2 rounded-lg border border-white/5">
                    <span className="text-[11px] text-[#908fa0]">عبارت ثبت شده شما:</span>
                    <span className="font-mono text-[13px] font-bold text-[#4edea3]">{security.antiPhishingCode}</span>
                  </div>
                )}
              </div>

              {/* Emergency Account Freeze */}
              <div className="p-3.5 rounded-xl bg-[#93000a]/20 border border-[#ff516a]/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#ff516a]">
                    <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                    <span className="text-[13px] font-bold">قفل اضطراری حساب کاربری</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${security.isAccountFrozen ? 'bg-[#ff516a] text-white' : 'bg-[#ff516a]/20 text-[#ffb2b7]'}`}>
                    {security.isAccountFrozen ? 'حساب قفل است' : 'آماده به خدمت'}
                  </span>
                </div>
                <p className="text-[11px] text-[#ffdad6]">
                  در صورت احساس هرگونه دسترسی غیرمجاز، فوراً کلیه برداشت‌ها، معاملات و دسترسی‌های API را برای ۲۴ ساعت تعلیق نمایید.
                </p>
                <button
                  onClick={handleToggleFreeze}
                  className={`w-full py-2 rounded-lg font-bold text-[12px] transition-colors ${
                    security.isAccountFrozen
                      ? 'bg-[#00a572] text-[#002113]'
                      : 'bg-[#ff516a] hover:bg-[#ff3b5c] text-white shadow-md'
                  }`}
                >
                  {security.isAccountFrozen ? 'خروج از وضعیت قفل اضطراری' : 'فعال‌سازی قفل فوری ۲۴ ساعته'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: 2FA */}
          {activeSubTab === '2fa' && (
            <div className="flex flex-col gap-4">
              <div className="p-3.5 rounded-xl bg-[#0d1c2d] border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#d4e4fa]">وضعیت گوگل آتنتیکیتور (Google Authenticator)</span>
                  <span className={`text-[12px] font-bold font-mono px-2 py-0.5 rounded-full ${security.twoFactorEnabled ? 'bg-[#4edea3]/20 text-[#4edea3]' : 'bg-white/10 text-[#908fa0]'}`}>
                    {security.twoFactorEnabled ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>

                {!security.twoFactorEnabled && (
                  <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
                    <p className="text-[12px] text-[#908fa0]">
                      ۱. اپلیکیشن Google Authenticator را روی تلفن همراه خود باز کنید.
                      <br />
                      ۲. کلید زیر را وارد کرده یا کد QR را اسکن فرمایید:
                    </p>

                    <div className="flex items-center justify-between bg-[#051424] px-3 py-2 rounded-xl border border-white/10 font-mono text-[13px] text-[#c0c1ff]">
                      <span>{security.twoFactorSecret || 'JBSWY3DPEHPK3PXP'}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(security.twoFactorSecret || 'JBSWY3DPEHPK3PXP');
                        }}
                        className="text-[11px] text-[#4edea3] hover:underline"
                      >
                        کپی کلید
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-[12px] text-[#d4e4fa]">کد ۶ رقمی نمایش داده شده در اپلیکیشن:</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={twoFactorInput}
                        onChange={(e) => setTwoFactorInput(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-[#051424] border border-white/10 px-3 py-2.5 rounded-xl text-center font-mono text-[18px] tracking-widest text-[#4edea3] outline-none"
                      />
                    </div>
                  </div>
                )}

                {twoFactorFeedback && (
                  <div className="p-2 rounded-lg bg-[#8083ff]/20 text-[#c0c1ff] text-[12px] text-center">
                    {twoFactorFeedback}
                  </div>
                )}

                <button
                  onClick={handleToggle2FA}
                  className={`w-full py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-md ${
                    security.twoFactorEnabled
                      ? 'bg-[#ff516a]/20 text-[#ffb2b7] border border-[#ff516a]/30 hover:bg-[#ff516a]/30'
                      : 'bg-gradient-to-r from-[#00a572] to-[#4edea3] text-[#002113]'
                  }`}
                >
                  {security.twoFactorEnabled ? 'غیرفعال‌سازی تایید دو مرحله‌ای' : 'تایید و فعال‌سازی 2FA'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WHITELIST */}
          {activeSubTab === 'whitelist' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d1c2d] border border-white/5">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#d4e4fa]">قفل آدرس‌های برداشتی (Whitelist Only)</span>
                  <span className="text-[11px] text-[#908fa0]">فقط آدرس‌های موجود در این لیست مجاز به دریافت وجه هستند</span>
                </div>
                <input
                  type="checkbox"
                  checked={security.addressWhitelistEnabled}
                  onChange={(e) => updateSecurity({ addressWhitelistEnabled: e.target.checked })}
                  className="w-5 h-5 accent-[#4edea3] cursor-pointer"
                />
              </div>

              {/* List of Whitelisted Addresses */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#c0c1ff]">آدرس‌های تایید شده ({security.whitelistAddresses.length})</span>
                  <button
                    onClick={() => setShowAddWl(!showAddWl)}
                    className="text-[11px] text-[#4edea3] font-bold flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>افزودن آدرس جدید</span>
                  </button>
                </div>

                {showAddWl && (
                  <form onSubmit={handleAddWhitelist} className="p-3 rounded-xl bg-[#051424] border border-white/10 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="نام برچسب (مثلاً کیف پول من)"
                        value={newWlLabel}
                        onChange={(e) => setNewWlLabel(e.target.value)}
                        className="bg-[#0d1c2d] border border-white/10 p-2 rounded-lg text-[12px] text-[#d4e4fa] outline-none"
                      />
                      <select
                        value={newWlCoin}
                        onChange={(e) => setNewWlCoin(e.target.value)}
                        className="bg-[#0d1c2d] border border-white/10 p-2 rounded-lg text-[12px] text-[#d4e4fa] outline-none"
                      >
                        <option value="USDT">USDT</option>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                        <option value="SOL">SOL</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="آدرس کیف پول..."
                      value={newWlAddr}
                      onChange={(e) => setNewWlAddr(e.target.value)}
                      className="bg-[#0d1c2d] border border-white/10 p-2 rounded-lg text-[12px] font-mono text-[#d4e4fa] outline-none dir-ltr"
                      dir="ltr"
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddWl(false)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-[11px]"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-[#4edea3] text-[#002113] font-bold text-[11px]"
                      >
                        ثبت در لیست سفید
                      </button>
                    </div>
                  </form>
                )}

                {security.whitelistAddresses.map((wl) => (
                  <div
                    key={wl.id}
                    className="p-3 rounded-xl bg-[#0d1c2d] border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[12px] text-[#d4e4fa]">{wl.label}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#1c2b3c] font-mono text-[10px] text-[#c0c1ff]">
                          {wl.coin} ({wl.network})
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#908fa0] truncate dir-ltr" dir="ltr">
                        {wl.address}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteWhitelist(wl.id)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#ff516a]/20 text-[#908fa0] hover:text-[#ff516a] flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SESSIONS */}
          {activeSubTab === 'sessions' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#c0c1ff]">نشست‌های فعال شما</span>
                {security.activeSessions.length > 1 && (
                  <button
                    onClick={handleTerminateOtherSessions}
                    className="text-[11px] text-[#ff516a] font-bold hover:underline"
                  >
                    خروج از سایر دستگاه‌ها
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {security.activeSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      sess.isCurrent
                        ? 'bg-[#00a572]/10 border-[#4edea3]/30'
                        : 'bg-[#0d1c2d] border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#1c2b3c] flex items-center justify-center text-[#c0c1ff]">
                        <span className="material-symbols-outlined text-[18px]">devices</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-bold text-[#d4e4fa]">{sess.device}</span>
                          {sess.isCurrent && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#4edea3]/20 text-[#4edea3] text-[9px] font-bold">
                              دستگاه فعلی
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#908fa0]">
                          {sess.location} • IP: <strong className="font-mono text-[#d4e4fa]">{sess.ip}</strong>
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#908fa0] font-mono">{sess.lastActive}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
