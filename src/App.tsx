/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExchangeProvider, useExchange } from './context/ExchangeContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { TradeView } from './components/TradeView';
import { MarketsView } from './components/MarketsView';
import { SwapEarnView } from './components/SwapEarnView';
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { TransferModal } from './components/modals/TransferModal';
import { SecurityModal } from './components/modals/SecurityModal';
import { SharePnLModal } from './components/modals/SharePnLModal';
import { PriceAlertModal } from './components/modals/PriceAlertModal';
import { NotificationCenter } from './components/modals/NotificationCenter';

const MainContent: React.FC = () => {
  const { activeTab } = useExchange();

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col">
      <Header />

      <main className="flex-1 w-full pt-16 pb-20 md:pb-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'markets' && <MarketsView />}
        {activeTab === 'trade' && <TradeView />}
        {activeTab === 'swap-and-earn' && <SwapEarnView />}
      </main>

      {/* Global Modals & Drawers */}
      <DepositModal />
      <WithdrawModal />
      <TransferModal />
      <SecurityModal />
      <SharePnLModal />
      <PriceAlertModal />
      <NotificationCenter />

      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <ExchangeProvider>
      <MainContent />
    </ExchangeProvider>
  );
}
