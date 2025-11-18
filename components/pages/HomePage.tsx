import React from 'react';
import { useTrades } from '../../hooks/useTrades';
import Card from '../common/Card';
import { Page, Trade } from '../../types';
import * as Recharts from 'recharts';
const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = Recharts;


interface HomePageProps {
  navigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { trades, loading } = useTrades();

  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const losingTrades = totalTrades - winningTrades;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const totalPL = trades.reduce((acc, trade) => acc + trade.pnl, 0);

  const chartData = trades
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

  if (loading) return <div className="text-center p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm text-gray-400">Total P/L</h3>
          <p className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${totalPL.toFixed(2)}
          </p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-400">Win Rate</h3>
          <p className="text-2xl font-bold text-primary">{winRate.toFixed(1)}%</p>
        </Card>
        <Card onClick={() => navigate(Page.Trades)}>
          <h3 className="text-sm text-gray-400">Total Trades</h3>
          <p className="text-2xl font-bold">{totalTrades}</p>
        </Card>
        <Card onClick={() => navigate(Page.Trades)}>
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
          <p className="text-center text-gray-400">Not enough data to display chart. Add at least two trades.</p>
        )}
      </Card>
    </div>
  );
};

export default HomePage;