import React from 'react';
import { useExchange } from '../../context/ExchangeContext';

export const NotificationCenter: React.FC = () => {
  const {
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    notifications,
    markNotificationAsRead,
    security,
  } = useExchange();

  if (!notificationDrawerOpen) return null;

  const markAllRead = () => {
    notifications.forEach((n) => markNotificationAsRead(n.id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SECURITY':
        return { icon: 'verified_user', color: 'text-[#4edea3] bg-[#00a572]/20' };
      case 'TRADE':
        return { icon: 'candlestick_chart', color: 'text-[#8083ff] bg-[#8083ff]/20' };
      case 'ALERT':
        return { icon: 'notifications_active', color: 'text-amber-400 bg-amber-500/20' };
      default:
        return { icon: 'info', color: 'text-[#908fa0] bg-white/10' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm h-full bg-[#122131] border-l border-white/10 shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0d1c2d]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8083ff] text-[22px]">notifications</span>
            <h3 className="font-bold text-[16px] text-[#d4e4fa]">اعلان‌ها و پیام‌های رسمی</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-[11px] text-[#8083ff] hover:underline"
            >
              خوانده شدن همه
            </button>
            <button
              onClick={() => setNotificationDrawerOpen(false)}
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#908fa0]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#908fa0]">
              <span className="material-symbols-outlined text-[36px] mb-2 opacity-50">mark_email_read</span>
              <span className="text-[13px]">پیام جدیدی وجود ندارد.</span>
            </div>
          ) : (
            notifications.map((item) => {
              const meta = getTypeIcon(item.type);
              return (
                <div
                  key={item.id}
                  onClick={() => markNotificationAsRead(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-[#0d1c2d]/70 border-white/5 opacity-70'
                      : 'bg-[#1c2b3c] border-[#8083ff]/30 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                      <span className="material-symbols-outlined text-[18px]">{meta.icon}</span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-[#d4e4fa] truncate">{item.title}</span>
                        <span className="text-[10px] text-[#908fa0] flex-shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-[#c7c4d7] mt-1 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Anti-phishing footer proof */}
        <div className="p-3.5 border-t border-white/10 bg-[#0d1c2d] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#908fa0]">
            <span className="material-symbols-outlined text-[16px] text-[#4edea3]">security</span>
            <span>کد ضد فیشینگ شما:</span>
          </div>
          <span className="font-mono text-[12px] font-bold text-[#4edea3] bg-[#00a572]/20 px-2 py-0.5 rounded">
            {security.antiPhishingCode}
          </span>
        </div>
      </div>
    </div>
  );
};
