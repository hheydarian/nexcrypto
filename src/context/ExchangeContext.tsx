import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Coin,
  Position,
  Order,
  StakingPool,
  SecuritySettings,
  NotificationItem,
  ActiveTab,
  OrderBook,
} from '../types/crypto';
import {
  INITIAL_COINS,
  INITIAL_POSITIONS,
  INITIAL_ORDERS,
  INITIAL_STAKING_POOLS,
  INITIAL_SECURITY,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import {
  generateOrderBook,
  fetchLiveRealPrices,
  fetchLiveTomanRate,
  DEFAULT_TOMAN_RATE,
  formatTomanHuman,
} from '../services/marketService';

interface ExchangeContextType {
  coins: Coin[];
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  selectedCoin: Coin;
  orderBook: OrderBook;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isBalanceHidden: boolean;
  toggleBalanceVisibility: () => void;
  currencyUnit: 'USD' | 'TOMAN';
  toggleCurrencyUnit: () => void;
  tomanRate: number;
  formatTomanHuman: (amount: number) => string;
  isLiveApiConnected: boolean;
  lastUpdatedTime: string;
  isRefreshingPrices: boolean;
  refreshPrices: () => Promise<void>;
  positions: Position[];
  orders: Order[];
  stakingPools: StakingPool[];
  security: SecuritySettings;
  notifications: NotificationItem[];
  favorites: string[];
  toggleFavorite: (symbol: string) => void;
  openTrade: (params: {
    side: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET' | 'STOP_LIMIT';
    price: number;
    amount: number;
    leverage: number;
  }) => { success: boolean; message: string };
  closePosition: (positionId: string) => void;
  updatePositionTpSl: (positionId: string, tp?: number, sl?: number) => void;
  reversePosition: (positionId: string) => void;
  cancelOrder: (orderId: string) => void;
  executeDeposit: (coinSymbol: string, amount: number, network: string) => void;
  executeWithdraw: (coinSymbol: string, amount: number, address: string, network: string) => { success: boolean; message: string };
  executeInternalTransfer: (coinSymbol: string, amount: number, recipientUid: string) => { success: boolean; message: string };
  executeSwap: (fromSymbol: string, toSymbol: string, fromAmount: number) => { success: boolean; message: string };
  executeStake: (poolId: string, amount: number) => { success: boolean; message: string };
  executeUnstake: (poolId: string, amount: number) => { success: boolean; message: string };
  updateSecurity: (newSettings: Partial<SecuritySettings>) => void;
  markNotificationAsRead: (id: string) => void;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  totalPortfolioUsd: number;
  totalPortfolioToman: number;
  dailyProfitUsd: number;
  // Modals state
  depositModalOpen: boolean;
  setDepositModalOpen: (open: boolean) => void;
  withdrawModalOpen: boolean;
  setWithdrawModalOpen: (open: boolean) => void;
  transferModalOpen: boolean;
  setTransferModalOpen: (open: boolean) => void;
  securityModalOpen: boolean;
  setSecurityModalOpen: (open: boolean) => void;
  sharePnlModalOpen: boolean;
  setSharePnlModalOpen: (open: boolean) => void;
  sharePnlPosition: Position | null;
  setSharePnlPosition: (pos: Position | null) => void;
  priceAlertModalOpen: boolean;
  setPriceAlertModalOpen: (open: boolean) => void;
  notificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (open: boolean) => void;
  depositCoinDefault: string;
  setDepositCoinDefault: (c: string) => void;
}

const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined);

export const ExchangeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Local storage persistence
  const [coins, setCoins] = useState<Coin[]>(() => {
    const saved = localStorage.getItem('nexcrypto_coins');
    if (!saved) return INITIAL_COINS;
    try {
      const parsed: Coin[] = JSON.parse(saved);
      const existingSymbols = new Set(parsed.map((c) => c.symbol));
      const missing = INITIAL_COINS.filter((c) => !existingSymbols.has(c.symbol));
      return [...parsed, ...missing];
    } catch {
      return INITIAL_COINS;
    }
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    const saved = localStorage.getItem('nexcrypto_positions');
    return saved ? JSON.parse(saved) : INITIAL_POSITIONS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nexcrypto_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [stakingPools, setStakingPools] = useState<StakingPool[]>(() => {
    const saved = localStorage.getItem('nexcrypto_staking');
    return saved ? JSON.parse(saved) : INITIAL_STAKING_POOLS;
  });

  const [security, setSecurity] = useState<SecuritySettings>(() => {
    const saved = localStorage.getItem('nexcrypto_security');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('nexcrypto_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexcrypto_favs');
    return saved ? JSON.parse(saved) : ['BTC', 'ETH'];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [currencyUnit, setCurrencyUnit] = useState<'USD' | 'TOMAN'>('USD');
  const [tomanRate, setTomanRate] = useState<number>(DEFAULT_TOMAN_RATE);
  const [isLiveApiConnected, setIsLiveApiConnected] = useState<boolean>(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('هم‌اکنون');
  const [isRefreshingPrices, setIsRefreshingPrices] = useState<boolean>(false);

  // Modals
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [sharePnlModalOpen, setSharePnlModalOpen] = useState(false);
  const [sharePnlPosition, setSharePnlPosition] = useState<Position | null>(null);
  const [priceAlertModalOpen, setPriceAlertModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [depositCoinDefault, setDepositCoinDefault] = useState('USDT');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nexcrypto_coins', JSON.stringify(coins));
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('nexcrypto_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('nexcrypto_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('nexcrypto_staking', JSON.stringify(stakingPools));
  }, [stakingPools]);

  useEffect(() => {
    localStorage.setItem('nexcrypto_security', JSON.stringify(security));
  }, [security]);

  useEffect(() => {
    localStorage.setItem('nexcrypto_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nexcrypto_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Selected coin derived
  const currentBaseSymbol = selectedSymbol.split('/')[0] || 'BTC';
  const selectedCoin = useMemo(() => {
    return coins.find((c) => c.symbol === currentBaseSymbol) || coins[0];
  }, [coins, currentBaseSymbol]);

  // Orderbook generation state
  const [orderBook, setOrderBook] = useState<OrderBook>(() =>
    generateOrderBook(selectedCoin.price)
  );

  // Live real-time market data syncer (KuCoin + CoinGecko + TGJU Toman)
  const syncLivePrices = async () => {
    try {
      const [liveData, liveToman] = await Promise.allSettled([
        fetchLiveRealPrices(),
        fetchLiveTomanRate(),
      ]);

      if (liveToman.status === 'fulfilled' && liveToman.value > 100000) {
        setTomanRate(liveToman.value);
      }

      if (liveData.status === 'fulfilled' && Object.keys(liveData.value).length > 0) {
        setIsLiveApiConnected(true);
        const now = new Date();
        setLastUpdatedTime(now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        setCoins((prevCoins) =>
          prevCoins.map((coin) => {
            const live = liveData.value[coin.symbol];
            if (live) {
              const currentHistory = coin.sparkline.length > 0 ? [...coin.sparkline] : [live.price];
              if (currentHistory[currentHistory.length - 1] !== live.price) {
                currentHistory.push(live.price);
                if (currentHistory.length > 8) currentHistory.shift();
              }
              return {
                ...coin,
                price: live.price,
                change24h: live.change24h,
                high24h: live.high24h,
                low24h: live.low24h,
                volume24h: live.volume24h || coin.volume24h,
                sparkline: currentHistory,
              };
            }
            return coin;
          })
        );
      }
    } catch {
      setIsLiveApiConnected(false);
    }
  };

  const refreshPrices = async () => {
    setIsRefreshingPrices(true);
    await syncLivePrices();
    setIsRefreshingPrices(false);
  };

  // Poll live prices & micro-fluctuations
  useEffect(() => {
    let isMounted = true;

    // Initial sync immediately
    syncLivePrices();

    // Fast orderbook and tick simulation every 1.5s for hyper-responsive feel
    const tickInterval = setInterval(() => {
      if (!isMounted) return;

      setCoins((prevCoins) => {
        return prevCoins.map((coin) => {
          if (coin.symbol === 'USDT') return coin;
          // Sub-tick micro jitter +- 0.02%
          const jitter = (Math.random() - 0.49) * 0.0004 * coin.price;
          const newPrice = Number((coin.price + jitter).toFixed(coin.decimals));
          return {
            ...coin,
            price: newPrice,
          };
        });
      });
    }, 1500);

    // Live public multi-API polling every 10 seconds
    const apiPollInterval = setInterval(() => {
      if (!isMounted) return;
      syncLivePrices();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(tickInterval);
      clearInterval(apiPollInterval);
    };
  }, []);

  // Update orderbook whenever selectedCoin price changes or USDT/TMN is selected
  useEffect(() => {
    const isUsdtToman = selectedSymbol === 'USDT/TMN';
    const mark = isUsdtToman ? tomanRate : selectedCoin.price;
    setOrderBook(generateOrderBook(mark));
  }, [selectedCoin.price, selectedSymbol, tomanRate]);

  // Update active positions PnL & ROE as price moves
  useEffect(() => {
    setPositions((prev) =>
      prev.map((pos) => {
        const coin = coins.find((c) => pos.symbol.startsWith(c.symbol));
        const mark = coin ? coin.price : pos.markPrice;
        const delta = pos.type === 'LONG' ? mark - pos.entryPrice : pos.entryPrice - mark;
        const pnl = Number((delta * pos.size).toFixed(2));
        const roe = Number(((pnl / pos.margin) * 100).toFixed(1));
        return {
          ...pos,
          markPrice: mark,
          pnl,
          roe,
        };
      })
    );
  }, [coins]);

  // Calculated Portfolio Totals
  const totalPortfolioUsd = useMemo(() => {
    const coinValue = coins.reduce((acc, c) => acc + c.balance * c.price, 0);
    const posMargin = positions.reduce((acc, p) => acc + p.margin + p.pnl, 0);
    const stakedValue = stakingPools.reduce((acc, s) => {
      const c = coins.find((coin) => coin.symbol === s.token);
      const pr = c ? c.price : 1;
      return acc + (s.userStaked + s.accruedReward) * pr;
    }, 0);
    return Math.round((coinValue + posMargin + stakedValue) * 100) / 100;
  }, [coins, positions, stakingPools]);

  const totalPortfolioToman = useMemo(() => {
    return Math.round(totalPortfolioUsd * tomanRate);
  }, [totalPortfolioUsd, tomanRate]);

  const dailyProfitUsd = useMemo(() => {
    return Math.round(totalPortfolioUsd * 0.0584 * 100) / 100;
  }, [totalPortfolioUsd]);

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden((prev) => !prev);
  };

  const toggleCurrencyUnit = () => {
    setCurrencyUnit((prev) => (prev === 'USD' ? 'TOMAN' : 'USD'));
  };

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'SYSTEM') => {
    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      time: 'هم‌اکنون',
      read: false,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Trade Execution
  const openTrade = (params: {
    side: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET' | 'STOP_LIMIT';
    price: number;
    amount: number;
    leverage: number;
  }) => {
    if (security.isAccountFrozen) {
      return { success: false, message: 'حساب کاربری در حالت تعلیق اضطراری است.' };
    }

    const tradeVal = params.price * params.amount;
    const requiredMargin = tradeVal / params.leverage;

    const usdtCoin = coins.find((c) => c.symbol === 'USDT');
    const availableMargin = usdtCoin ? usdtCoin.balance : 0;

    if (requiredMargin > availableMargin) {
      return {
        success: false,
        message: `موجودی مارجین ناکافی است. نیاز: $${requiredMargin.toFixed(2)} | در دسترس: $${availableMargin.toFixed(2)}`,
      };
    }

    // Deduct USDT margin
    setCoins((prev) =>
      prev.map((c) => (c.symbol === 'USDT' ? { ...c, balance: c.balance - requiredMargin } : c))
    );

    if (params.type === 'MARKET') {
      // Create active position directly
      const posType: 'LONG' | 'SHORT' = params.side === 'BUY' ? 'LONG' : 'SHORT';
      const liqDelta = (params.price / params.leverage) * 0.9;
      const liqPrice =
        posType === 'LONG'
          ? Math.max(0, params.price - liqDelta)
          : params.price + liqDelta;

      const newPos: Position = {
        id: `pos-${Date.now()}`,
        symbol: selectedSymbol,
        type: posType,
        entryPrice: params.price,
        markPrice: params.price,
        liquidationPrice: Number(liqPrice.toFixed(2)),
        leverage: params.leverage,
        margin: Number(requiredMargin.toFixed(2)),
        size: params.amount,
        pnl: 0,
        roe: 0,
        timestamp: Date.now(),
      };

      setPositions((prev) => [newPos, ...prev]);
      addNotification(
        'پوزیشن جدید فیوچرز باز شد',
        `پوزیشن ${posType === 'LONG' ? 'خرید (Long)' : 'فروش (Short)'} با حجم ${params.amount} ${selectedCoin.symbol} و اهرم ${params.leverage}x باز شد.`,
        'TRADE'
      );

      return { success: true, message: 'سفارش مارکت انجام شد و پوزیشن باز شد.' };
    } else {
      // Create Limit Order
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        symbol: selectedSymbol,
        side: params.side,
        type: params.type,
        price: params.price,
        amount: params.amount,
        filled: 0,
        leverage: params.leverage,
        status: 'OPEN',
        timestamp: Date.now(),
      };
      setOrders((prev) => [newOrder, ...prev]);
      addNotification(
        'سفارش محدود با موفقیت ثبت شد',
        `سفارش ${params.side === 'BUY' ? 'خرید' : 'فروش'} در قیمت $${params.price.toLocaleString()} در اوردربوک قرار گرفت.`,
        'TRADE'
      );
      return { success: true, message: 'سفارش لیمیت در اوردربوک ثبت گردید.' };
    }
  };

  const closePosition = (posId: string) => {
    const target = positions.find((p) => p.id === posId);
    if (!target) return;

    // Return margin + PnL to USDT
    const refund = Math.max(0, target.margin + target.pnl);
    setCoins((prev) =>
      prev.map((c) => (c.symbol === 'USDT' ? { ...c, balance: c.balance + refund } : c))
    );

    setPositions((prev) => prev.filter((p) => p.id !== posId));
    addNotification(
      'پوزیشن با موفقیت بسته شد',
      `پوزیشن ${target.symbol} با سود/زیان $${target.pnl.toFixed(2)} تسویه گردید و $${refund.toFixed(2)} به کیف پول بازگشت.`,
      'TRADE'
    );
  };

  const updatePositionTpSl = (positionId: string, tp?: number, sl?: number) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === positionId ? { ...p, tp, sl } : p))
    );
    addNotification('تنظیم حد سود/ضرر', 'حدود سود و ضرر پوزیشن با موفقیت به‌روزرسانی شد.', 'SYSTEM');
  };

  const reversePosition = (positionId: string) => {
    setPositions((prev) =>
      prev.map((p) => {
        if (p.id !== positionId) return p;
        const newType = p.type === 'LONG' ? 'SHORT' : 'LONG';
        const liqDelta = (p.markPrice / p.leverage) * 0.9;
        const newLiq =
          newType === 'LONG'
            ? Math.max(0, p.markPrice - liqDelta)
            : p.markPrice + liqDelta;
        return {
          ...p,
          type: newType,
          entryPrice: p.markPrice,
          liquidationPrice: Number(newLiq.toFixed(2)),
          pnl: 0,
          roe: 0,
        };
      })
    );
    addNotification('پوزیشن معکوس شد', 'جهت پوزیشن بلافاصله تغییر کرد.', 'TRADE');
  };

  const cancelOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    // Refund margin
    const req = (target.price * target.amount) / target.leverage;
    setCoins((prev) =>
      prev.map((c) => (c.symbol === 'USDT' ? { ...c, balance: c.balance + req } : c))
    );

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    addNotification('سفارش لغو شد', 'مبلغ مارجین بلوکه‌شده به حساب بازگشت.', 'SYSTEM');
  };

  // Deposit simulator
  const executeDeposit = (coinSymbol: string, amount: number, network: string) => {
    setCoins((prev) =>
      prev.map((c) =>
        c.symbol === coinSymbol ? { ...c, balance: c.balance + amount } : c
      )
    );
    addNotification(
      'تایید واریز موفق',
      `مبلغ ${amount} ${coinSymbol} با موفقیت از طریق شبکه ${network} تایید و به موجودی اضافه شد.`,
      'TRADE'
    );
  };

  // Withdrawal with Whitelist & 2FA checks
  const executeWithdraw = (
    coinSymbol: string,
    amount: number,
    address: string,
    network: string
  ) => {
    if (security.isAccountFrozen) {
      return { success: false, message: 'حساب شما قفل امنیتی است. امکان برداشت موقتاً مسدود می‌باشد.' };
    }

    const coin = coins.find((c) => c.symbol === coinSymbol);
    if (!coin || coin.balance < amount) {
      return { success: false, message: 'موجودی دارایی برای این برداشت کافی نیست.' };
    }

    if (security.addressWhitelistEnabled) {
      const isWhitelisted = security.whitelistAddresses.some(
        (w) => w.coin === coinSymbol && w.address.toLowerCase() === address.toLowerCase()
      );
      if (!isWhitelisted) {
        return {
          success: false,
          message: 'آدرس وارد شده در لیست سفید آدرس‌های تایید شده شما وجود ندارد! جهت امنیت، برداشت رد شد.',
        };
      }
    }

    // Deduct
    setCoins((prev) =>
      prev.map((c) => (c.symbol === coinSymbol ? { ...c, balance: c.balance - amount } : c))
    );

    addNotification(
      'درخواست برداشت با موفقیت ارسال شد',
      `برداشت ${amount} ${coinSymbol} به آدرس ${address.slice(0, 8)}... ارسال شد و پس از تایید نودها منتقل می‌شود.`,
      'TRADE'
    );

    return { success: true, message: 'تراکنش برداشت در شبکه بلاک‌چین برودکست شد.' };
  };

  // Internal Transfer (UID / Email)
  const executeInternalTransfer = (coinSymbol: string, amount: number, recipientUid: string) => {
    const coin = coins.find((c) => c.symbol === coinSymbol);
    if (!coin || coin.balance < amount) {
      return { success: false, message: 'موجودی کافی نیست.' };
    }

    setCoins((prev) =>
      prev.map((c) => (c.symbol === coinSymbol ? { ...c, balance: c.balance - amount } : c))
    );

    addNotification(
      'انتقال داخلی انجام شد',
      `مبلغ ${amount} ${coinSymbol} به کاربر ${recipientUid} با کارمزد صفر منتقل شد.`,
      'TRADE'
    );

    return { success: true, message: 'انتقال داخلی آنی انجام گردید.' };
  };

  // Instant Swap Engine
  const executeSwap = (fromSymbol: string, toSymbol: string, fromAmount: number) => {
    const fromCoin = coins.find((c) => c.symbol === fromSymbol);
    const toCoin = coins.find((c) => c.symbol === toSymbol);

    if (!fromCoin || !toCoin) return { success: false, message: 'ارز نامعتبر است.' };
    if (fromCoin.balance < fromAmount) return { success: false, message: 'موجودی مبدا کافی نیست.' };

    const usdVal = fromAmount * fromCoin.price;
    const toAmount = Number((usdVal / toCoin.price).toFixed(toCoin.decimals));

    setCoins((prev) =>
      prev.map((c) => {
        if (c.symbol === fromSymbol) return { ...c, balance: c.balance - fromAmount };
        if (c.symbol === toSymbol) return { ...c, balance: c.balance + toAmount };
        return c;
      })
    );

    addNotification(
      'تبدیل سریع موفقیت‌آمیز بود',
      `تبدیل ${fromAmount} ${fromSymbol} به ${toAmount} ${toSymbol} با نرخ زنده بدون کارمزد انجام شد.`,
      'TRADE'
    );

    return { success: true, message: 'تبدیل آنی با موفقیت انجام شد!' };
  };

  // Staking
  const executeStake = (poolId: string, amount: number) => {
    const pool = stakingPools.find((p) => p.id === poolId);
    if (!pool) return { success: false, message: 'صندوق یافت نشد.' };

    const coin = coins.find((c) => c.symbol === pool.token);
    if (!coin || coin.balance < amount) return { success: false, message: 'موجودی دارایی کافی نیست.' };

    // Deduct coin balance, add to userStaked
    setCoins((prev) =>
      prev.map((c) => (c.symbol === pool.token ? { ...c, balance: c.balance - amount } : c))
    );

    setStakingPools((prev) =>
      prev.map((p) => (p.id === poolId ? { ...p, userStaked: p.userStaked + amount } : p))
    );

    addNotification(
      'سپرده‌گذاری با موفقیت آغاز شد',
      `مبلغ ${amount} ${pool.token} در ${pool.nameFa} با سود سالانه ${pool.apy}% استیک شد.`,
      'SYSTEM'
    );

    return { success: true, message: 'سپرده‌گذاری با موفقیت فعال شد.' };
  };

  const executeUnstake = (poolId: string, amount: number) => {
    const pool = stakingPools.find((p) => p.id === poolId);
    if (!pool || pool.userStaked < amount) return { success: false, message: 'موجودی استیک شده کافی نیست.' };

    setCoins((prev) =>
      prev.map((c) => (c.symbol === pool.token ? { ...c, balance: c.balance + amount } : c))
    );

    setStakingPools((prev) =>
      prev.map((p) => (p.id === poolId ? { ...p, userStaked: p.userStaked - amount } : p))
    );

    addNotification('برداشت از استیکینگ', `مبلغ ${amount} ${pool.token} به کیف پول اصلی بازگردانده شد.`, 'SYSTEM');
    return { success: true, message: 'برداشت از صندوق با موفقیت انجام شد.' };
  };

  const updateSecurity = (newSettings: Partial<SecuritySettings>) => {
    setSecurity((prev) => ({ ...prev, ...newSettings }));
    addNotification('تنظیمات امنیتی به‌روز شد', 'تغییرات پروتکل امنیتی حساب شما اعمال گردید.', 'SECURITY');
  };

  return (
    <ExchangeContext.Provider
      value={{
        coins,
        selectedSymbol,
        setSelectedSymbol,
        selectedCoin,
        orderBook,
        activeTab,
        setActiveTab,
        isBalanceHidden,
        toggleBalanceVisibility,
        currencyUnit,
        toggleCurrencyUnit,
        tomanRate,
        formatTomanHuman,
        isLiveApiConnected,
        lastUpdatedTime,
        isRefreshingPrices,
        refreshPrices,
        positions,
        orders,
        stakingPools,
        security,
        notifications,
        favorites,
        toggleFavorite,
        openTrade,
        closePosition,
        updatePositionTpSl,
        reversePosition,
        cancelOrder,
        executeDeposit,
        executeWithdraw,
        executeInternalTransfer,
        executeSwap,
        executeStake,
        executeUnstake,
        updateSecurity,
        markNotificationAsRead,
        addNotification,
        totalPortfolioUsd,
        totalPortfolioToman,
        dailyProfitUsd,
        depositModalOpen,
        setDepositModalOpen,
        withdrawModalOpen,
        setWithdrawModalOpen,
        transferModalOpen,
        setTransferModalOpen,
        securityModalOpen,
        setSecurityModalOpen,
        sharePnlModalOpen,
        setSharePnlModalOpen,
        sharePnlPosition,
        setSharePnlPosition,
        priceAlertModalOpen,
        setPriceAlertModalOpen,
        notificationDrawerOpen,
        setNotificationDrawerOpen,
        depositCoinDefault,
        setDepositCoinDefault,
      }}
    >
      {children}
    </ExchangeContext.Provider>
  );
};

export const useExchange = () => {
  const context = useContext(ExchangeContext);
  if (!context) throw new Error('useExchange must be used within ExchangeProvider');
  return context;
};
