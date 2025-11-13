import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Page, Trade } from '../../types';
import { useTrades } from '../../hooks/useTrades';
import { useAccounts } from '../../hooks/useAccounts';
import Card from '../common/Card';
import StarRating from '../common/StarRating';
import AddTradePage from './AddTradePage';
import { analyzeTradeWithGemini } from '../../geminiService';
import TradeListItem from '../common/TradeListItem';
import TradeDetailView from '../common/TradeDetailView';

interface TradesListPageProps {
    navigate: (page: Page) => void;
}

// Helper function to get the start of a given time unit
const getStartOf = (unit: 'day' | 'week' | 'month', date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (unit === 'week') {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
        d.setDate(diff);
    } else if (unit === 'month') {
        d.setDate(1);
    }
    return d;
};


const TradesListPage: React.FC<TradesListPageProps> = ({ navigate }) => {
  const { trades, loading, deleteTrade } = useTrades();
  const { accounts } = useAccounts();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPair, setSelectedPair] = useState('all');
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);

  const uniquePairs = useMemo(() => {
    const pairs = new Set(trades.map(t => t.pair));
    return ['all', ...Array.from(pairs)];
  }, [trades]);

  const tradesToDisplay = useMemo(() => {
    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if(start) start.setHours(0,0,0,0);
      if(end) end.setHours(23,59,59,999);
      
      if (selectedAccountId !== 'all' && trade.accountId !== selectedAccountId) {
        return false;
      }
      if (selectedPair !== 'all' && trade.pair !== selectedPair) {
        return false;
      }
      if (start && tradeDate < start) {
        return false;
      }
      if (end && tradeDate > end) {
        return false;
      }
      return true;
    });
  }, [trades, startDate, endDate, selectedPair, selectedAccountId]);
  
  const groupedTrades = useMemo(() => {
    // FIX: Explicitly typed the accumulator in the reduce function to ensure
    // TypeScript correctly infers the type of `groupedTrades`. This resolves
    // an error where `tradesOnDate.map` would be called on an `unknown` type.
    return tradesToDisplay.reduce((acc: Record<string, Trade[]>, trade) => {
        const date = new Date(trade.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(trade);
        return acc;
    }, {});
  }, [tradesToDisplay]);
  
  const handleEdit = (trade: Trade) => {
      setTradeToEdit(trade);
      setSelectedTrade(null);
  };
  
  const handleCancelEdit = () => {
      setTradeToEdit(null);
  };

  const handleDelete = async (tradeId: string) => {
      await deleteTrade(tradeId);
      setSelectedTrade(null);
  }

  const handleFilterPeriodChange = (period: string) => {
    setFilterPeriod(period);
    const now = new Date();
    let start = '';
    let end = (period !== 'all') ? now.toISOString().split('T')[0] : ''; 

    if (period === 'today') {
        start = now.toISOString().split('T')[0];
    } else if (period === 'week') {
        start = getStartOf('week', now).toISOString().split('T')[0];
    } else if (period === 'month') {
        start = getStartOf('month', now).toISOString().split('T')[0];
    }
    
    setStartDate(start);
    setEndDate(end);
  };

  const handleDateChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setFilterPeriod('custom');
  };

  if (tradeToEdit) {
    return <AddTradePage navigate={navigate} tradeToEdit={tradeToEdit} onClose={handleCancelEdit} />;
  }
  
  if (selectedTrade) {
    return (
      <TradeDetailView
        trade={selectedTrade}
        onBack={() => setSelectedTrade(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }
  
  if (!selectedTrade && !tradeToEdit) {
    const inputClasses = "w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm";
    const selectClasses = `${inputClasses} appearance-none`;
    const commonButtonClasses = "px-3 py-1 text-sm rounded-full transition-colors focus:outline-none";
    const activeButtonClasses = "bg-primary text-white";
    const inactiveButtonClasses = "bg-light-bg dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600";
    const visibleAccounts = accounts.filter(acc => acc.id !== 'default');

    return (
      <>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">All Trades</h2>
          
          <Card>
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => handleFilterPeriodChange('all')} className={`${commonButtonClasses} ${filterPeriod === 'all' ? activeButtonClasses : inactiveButtonClasses}`}>All Time</button>
                <button onClick={() => handleFilterPeriodChange('today')} className={`${commonButtonClasses} ${filterPeriod === 'today' ? activeButtonClasses : inactiveButtonClasses}`}>Today</button>
                <button onClick={() => handleFilterPeriodChange('week')} className={`${commonButtonClasses} ${filterPeriod === 'week' ? activeButtonClasses : inactiveButtonClasses}`}>This Week</button>
                <button onClick={() => handleFilterPeriodChange('month')} className={`${commonButtonClasses} ${filterPeriod === 'month' ? activeButtonClasses : inactiveButtonClasses}`}>This Month</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Trading Account</label>
                    <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className={selectClasses}>
                        <option value="all">All Accounts</option>
                        {visibleAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Pair</label>
                    <select value={selectedPair} onChange={e => setSelectedPair(e.target.value)} className={selectClasses}>
                        {uniquePairs.map(p => <option key={p} value={p}>{p === 'all' ? 'All Pairs' : p}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-400 mb-1">From</label>
                     <input type="date" value={startDate} onChange={e => handleDateChange(setStartDate, e.target.value)} className={inputClasses} />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-400 mb-1">To</label>
                     <input type="date" value={endDate} onChange={e => handleDateChange(setEndDate, e.target.value)} className={inputClasses} />
                </div>
            </div>
          </Card>
          
          {Object.entries(groupedTrades).map(([date, tradesOnDate]) => (
              <div key={date}>
                  <h3 className="font-semibold text-gray-400 my-4">{date}</h3>
                  {(tradesOnDate as Trade[]).map(trade => (
                      <TradeListItem key={trade.id} trade={trade} onClick={() => setSelectedTrade(trade)} />
                  ))}
              </div>
          ))}

          {tradesToDisplay.length === 0 && !loading && (
            <div className="text-center py-10">
              <p className="text-gray-400">No trades found for the selected filters.</p>
            </div>
          )}
        </div>
        
        <button
            onClick={() => navigate(Page.Add)}
            className="fixed bottom-24 right-8 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-20 flex items-center justify-center"
            aria-label="Add new trade"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
        </button>
      </>
    );
  }
  
  return null;
};

export default TradesListPage;
