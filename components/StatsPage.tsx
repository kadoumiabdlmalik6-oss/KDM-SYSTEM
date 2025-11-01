import React, { useMemo, useState } from 'react';
import { useTrades } from '../hooks/useTrades';
import Card from './common/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// Helper function to get the start of a given time unit
const getStartOf = (unit: 'day' | 'week' | 'month' | 'year', date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (unit === 'week') {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        d.setDate(diff);
    } else if (unit === 'month') {
        d.setDate(1);
    } else if (unit === 'year') {
        d.setMonth(0, 1);
    }
    return d;
};

const StatsPage: React.FC = () => {
  const { trades, loading } = useTrades();
  const [period, setPeriod] = useState('all'); // 'all', 'today', 'week', 'month', 'year', 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredTrades = useMemo(() => {
    if (period === 'all') return trades;

    let startDate: Date;
    let endDate: Date = new Date(); // Default end date is now

    const now = new Date();
    switch (period) {
        case 'today':
            startDate = getStartOf('day', now);
            break;
        case 'week':
            startDate = getStartOf('week', now);
            break;
        case 'month':
            startDate = getStartOf('month', now);
            break;
        case 'year':
            startDate = getStartOf('year', now);
            break;
        case 'custom':
            if (!customStart || !customEnd) return [];
            startDate = new Date(customStart);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(customEnd);
            endDate.setHours(23, 59, 59, 999);
            break;
        default:
            return trades;
    }

    return trades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= startDate && tradeDate <= endDate;
    });
  }, [trades, period, customStart, customEnd]);

  const performanceData = useMemo(() => {
    return filteredTrades
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((trade, index) => ({
        name: `Trade ${index + 1}`,
        date: new Date(trade.date).toLocaleDateString(),
        pnl: trade.pnl,
      }));
  }, [filteredTrades]);

  const pnlByPair = useMemo(() => {
    const pairMap = new Map<string, number>();
    filteredTrades.forEach(trade => {
      const pnl = trade.pnl;
      pairMap.set(trade.pair, (pairMap.get(trade.pair) || 0) + pnl);
    });
    return Array.from(pairMap.entries()).map(([pair, totalPnl]) => ({ pair, totalPnl }));
  }, [filteredTrades]);

  if (loading) return <div className="text-center p-8">Loading stats...</div>;

  const commonButtonClasses = "px-3 py-1 text-sm rounded-full transition-colors focus:outline-none";
  const activeButtonClasses = "bg-primary text-white";
  const inactiveButtonClasses = "bg-light-card dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-gray-700";
  const inputClasses = "p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Statistics</h2>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Filter by Period</h3>
        <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setPeriod('all')} className={`${commonButtonClasses} ${period === 'all' ? activeButtonClasses : inactiveButtonClasses}`}>All Time</button>
            <button onClick={() => setPeriod('today')} className={`${commonButtonClasses} ${period === 'today' ? activeButtonClasses : inactiveButtonClasses}`}>Today</button>
            <button onClick={() => setPeriod('week')} className={`${commonButtonClasses} ${period === 'week' ? activeButtonClasses : inactiveButtonClasses}`}>This Week</button>
            <button onClick={() => setPeriod('month')} className={`${commonButtonClasses} ${period === 'month' ? activeButtonClasses : inactiveButtonClasses}`}>This Month</button>
            <button onClick={() => setPeriod('year')} className={`${commonButtonClasses} ${period === 'year' ? activeButtonClasses : inactiveButtonClasses}`}>This Year</button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
            <input type="date" value={customStart} onChange={e => {setCustomStart(e.target.value); if(customEnd) setPeriod('custom')}} className={inputClasses} />
            <span className="text-gray-400">to</span>
            <input type="date" value={customEnd} onChange={e => {setCustomEnd(e.target.value); if(customStart) setPeriod('custom')}} className={inputClasses} />
        </div>
      </Card>
      
      {filteredTrades.length === 0 && !loading && <div className="text-center p-8 text-gray-400">No trading data available for the selected period.</div>}

      {filteredTrades.length > 0 && (
        <>
          <Card>
            <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="grey" />
                  <YAxis tick={{ fontSize: 10 }} stroke="grey" />
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(30,30,30,0.8)',
                        borderColor: '#2563eb',
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="pnl" name="P/L per Trade" stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold mb-4">Total P/L by Pair</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={pnlByPair} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="pair" width={80} tick={{ fontSize: 12 }} stroke="grey" />
                  <Tooltip 
                     contentStyle={{ 
                        backgroundColor: 'rgba(30,30,30,0.8)',
                        borderColor: '#2563eb',
                     }} 
                  />
                  <Legend />
                  <Bar dataKey="totalPnl" name="Total P/L" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default StatsPage;