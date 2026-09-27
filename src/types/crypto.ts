export interface Coin {
  symbol: string;
  name: string;
  nameFa: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  category: ('spot' | 'futures' | 'ai' | 'defi' | 'l1' | 'meme' | 'telegram')[];
  sparkline: number[];
  decimals: number;
  iconColor: string;
  balance: number;
  isHot?: boolean;
}

export interface OrderBookItem {
  price: number;
  amount: number;
  total: number;
  depthPercent: number;
}

export interface OrderBook {
  asks: OrderBookItem[];
  bids: OrderBookItem[];
  spread: number;
  spreadPercent: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  leverage: number;
  margin: number;
  size: number;
  pnl: number;
  roe: number;
  tp?: number;
  sl?: number;
  timestamp: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP_LIMIT';
  price: number;
  amount: number;
  filled: number;
  leverage: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  timestamp: number;
}

export interface TradeHistoryItem {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  amount: number;
  total: number;
  fee: number;
  time: string;
  txHash: string;
}

export interface StakingPool {
  id: string;
  name: string;
  nameFa: string;
  token: string;
  apy: number;
  period: string;
  minDeposit: number;
  totalLocked: string;
  dailyRewardPerUnit: string;
  userStaked: number;
  accruedReward: number;
}

export interface WhitelistAddress {
  id: string;
  coin: string;
  address: string;
  network: string;
  label: string;
  createdAt: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  antiPhishingCode: string;
  addressWhitelistEnabled: boolean;
  whitelistAddresses: WhitelistAddress[];
  coldStorageProtection: boolean;
  isAccountFrozen: boolean;
  biometricsEnabled: boolean;
  lastLogin: string;
  activeSessions: {
    id: string;
    device: string;
    browser: string;
    ip: string;
    location: string;
    isCurrent: boolean;
    lastActive: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'SECURITY' | 'TRADE' | 'SYSTEM';
  time: string;
  read: boolean;
}

export type ActiveTab = 'dashboard' | 'markets' | 'trade' | 'swap-and-earn';
