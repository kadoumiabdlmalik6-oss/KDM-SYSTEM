import React, { useMemo, useState } from 'react';
import { useTrades } from '../../hooks/useTrades';
import Card from '../common/Card';
import { Account, Page, Trade } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TradeListItem from '../common/TradeListItem';
import TradeDetailView from '../common/TradeDetailView';
import AddTradePage from './AddTradePage';


interface AccountStatsPageProps {
  account: Account;
  onBack: () => void;
}

const AccountStatsPage: React.FC<AccountStatsPageProps> = ({ account, onBack }) => {
  const { trades, loading, deleteTrade } = useTrades();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);

  const accountTrades = useMemo(() => {
    return trades
        .filter(t => t.accountId === account.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trades, account.id]);
  
  const totalTrades = accountTrades.length;
  const winningTrades = accountTrades.filter(t => t.pnl > 0).length;
  const losingTrades = totalTrades - winningTrades;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPL = accountTrades.reduce((acc, trade) => acc + trade.pnl, 0);
  const currentBalance = (account.balance || 0) + totalPL;

  const chartData = accountTrades
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, trade, index) => {
      const pnl = trade.pnl;
      const cumulativePnl = (acc[index - 1]?.cumulativePnl || 0) + pnl;
      acc.push({
        name: `Trade ${index + 1}`,
        pnl: pnl,
        cumulativePnl: cumulativePnl,
      });
      return acc;
    }, [] as { name: string; pnl: number; cumulativePnl: number }[]);

  const handleEdit = (trade: Trade) => {
    setTradeToEdit(trade);
    setSelectedTrade(null);
  };

  const handleDelete = (tradeId: string) => {
      deleteTrade(tradeId);
      setSelectedTrade(null);
  };

  if (loading) return <div className="text-center p-8">Loading dashboard...</div>;

  if (tradeToEdit) {
    return <AddTradePage navigate={() => {}} tradeToEdit={tradeToEdit} onClose={() => setTradeToEdit(null)} />;
  }

  if (selectedTrade) {
    return (
        <TradeDetailView
            trade={selectedTrade}
            onBack={() => setSelectedTrade(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    )
  }
  
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-primary font-semibold mb-2">&larr; Back to Accounts</button>
      <h2 className="text-2xl font-semibold">{account.name} - Dashboard</h2>
      
      {accountTrades.length === 0 && (
          <p className="text-center text-gray-400 py-8">No trading data available for this account.</p>
      )}

      {accountTrades.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm text-gray-400">Current Balance</h3>
              <p className={`text-2xl font-bold ${currentBalance >= (account.balance || 0) ? 'text-green-500' : 'text-red-500'}`}>
                ${currentBalance.toFixed(2)}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm text-gray-400">Total P/L</h3>
              <p className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${totalPL.toFixed(2)}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm text-gray-400">Initial Balance</h3>
              <p className="text-2xl font-bold text-gray-400">${(account.balance || 0).toFixed(2)}</p>
            </Card>
            <Card>
              <h3 className="text-sm text-gray-400">Win Rate</h3>
              <p className="text-2xl font-bold text-primary">{winRate.toFixed(1)}%</p>
            </Card>
            <Card>
              <h3 className="text-sm text-gray-400">Total Trades</h3>
              <p className="text-2xl font-bold">{totalTrades}</p>
            </Card>
            <Card>
              <h3 className="text-sm text-gray-400">Winners / Losers</h3>
              <p className="text-2xl font-bold">
                <span className="text-green-500">{winningTrades}</span> / <span className="text-red-500">{losingTrades}</span>
              </p>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Performance</h3>
            {chartData.length > 1 ? (
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="grey" />
                    <YAxis tick={{ fontSize: 10 }} stroke="grey" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(30,30,30,0.8)',
                        borderColor: '#2563eb',
                        color: '#e0e0e0'
                      }}
                    />
                    <Line type="monotone" dataKey="cumulativePnl" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-400">Not enough data to display chart. Add at least two trades to this account.</p>
            )}
          </Card>

          <h3 className="text-xl font-semibold pt-4">Trades</h3>
           <div className="space-y-4">
              {accountTrades.map(trade => (
                <TradeListItem key={trade.id} trade={trade} onClick={() => setSelectedTrade(trade)} />
              ))}
          </div>

        </>
      )}
    </div>
  );
};

export default AccountStatsPage;