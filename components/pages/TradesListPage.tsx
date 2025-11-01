import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Page, Trade } from '../../types';
import { useTrades } from '../../hooks/useTrades';
import Card from '../common/Card';
import StarRating from '../common/StarRating';
import AddTradePage from './AddTradePage';
import { analyzeTradeWithGemini } from '../../geminiService';
import TradeListItem from '../common/TradeListItem';

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

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const TradesListPage: React.FC<TradesListPageProps> = ({ navigate }) => {
  const { trades, loading, deleteTrade } = useTrades();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPair, setSelectedPair] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
  }, [trades, startDate, endDate, selectedPair]);
  
  const groupedTrades = useMemo(() => {
    return tradesToDisplay.reduce<Record<string, Trade[]>>((acc, trade) => {
        const date = new Date(trade.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(trade);
        return acc;
    }, {});
  }, [tradesToDisplay]);

  const handleAnalyze = async () => {
    if (!selectedTrade) return;
    setIsAnalyzing(true);
    setAnalysis('');
    const result = await analyzeTradeWithGemini(selectedTrade);
    setAnalysis(result);
    setIsAnalyzing(false);
  };
  
  const handleEdit = () => {
      if (selectedTrade) {
          setTradeToEdit(selectedTrade);
          setSelectedTrade(null);
      }
  };
  
  const handleCancelEdit = () => {
      setTradeToEdit(null);
  };

  const handleDelete = () => {
      if (selectedTrade && window.confirm('Are you sure you want to delete this trade?')) {
          deleteTrade(selectedTrade.id);
          setSelectedTrade(null);
      }
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

  const handleDownloadCSV = () => {
    if (tradesToDisplay.length === 0) {
        alert("No trades to download for the selected filters.");
        return;
    }

    const headers = ["Date", "Pair", "Type", "Session", "P/L ($)", "R/R", "Rating", "Notes"];
    
    // Helper to safely wrap data in quotes for CSV
    const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;

    const csvContent = [
        headers.join(','),
        ...tradesToDisplay.map(trade => [
            new Date(trade.date).toLocaleString(),
            trade.pair,
            trade.type,
            trade.session,
            trade.pnl.toFixed(2),
            trade.rr,
            trade.rating,
            escapeCSV(trade.notes)
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "kdm_journal_trades_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };


  if (tradeToEdit) {
    return <AddTradePage navigate={navigate} tradeToEdit={tradeToEdit} onClose={handleCancelEdit} />;
  }
  
  if (selectedTrade) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button onClick={() => { setSelectedTrade(null); setAnalysis(''); }} className="text-primary font-semibold">&larr; Back to list</button>
        </div>
        
        <Card>
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">{selectedTrade.pair}</h2>
                <div className={`px-3 py-1 text-sm font-semibold rounded-full ${selectedTrade.type === 'buy' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {selectedTrade.type.toUpperCase()}
                </div>
            </div>
            <div className="mt-2 text-gray-400 text-sm">
                {new Date(selectedTrade.date).toLocaleString()} &bull; {selectedTrade.session}
            </div>
        </Card>
        
        <Card>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-sm text-gray-400">Result</h4>
                    <p className={`text-lg font-bold ${selectedTrade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedTrade.pnl >= 0 ? '+' : ''}${selectedTrade.pnl.toFixed(2)}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm text-gray-400">Risk/Reward</h4>
                    <p className="text-lg font-bold">1:{selectedTrade.rr}</p>
                </div>
                {selectedTrade.entryPrice && <div><h4 className="text-sm text-gray-400">Entry</h4><p>{selectedTrade.entryPrice}</p></div>}
                {selectedTrade.exitPrice && <div><h4 className="text-sm text-gray-400">Exit</h4><p>{selectedTrade.exitPrice}</p></div>}
            </div>
            <div className="mt-4">
                 <h4 className="text-sm text-gray-400 mb-1">Rating</h4>
                 <StarRating rating={selectedTrade.rating} />
            </div>
        </Card>
        
        {selectedTrade.notes && (
            <Card>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{selectedTrade.notes}</p>
            </Card>
        )}

        {(selectedTrade.beforeImageUrl || selectedTrade.afterImageUrl) && (
            <Card>
                <h4 className="font-semibold mb-2">Attachments</h4>
                <div className="flex gap-4">
                    {selectedTrade.beforeImageUrl && (
                        <div>
                            <p className="text-sm text-center mb-1 text-gray-400">Before</p>
                            <img src={selectedTrade.beforeImageUrl} alt="Before trade" className="rounded-lg max-h-48" />
                        </div>
                    )}
                    {selectedTrade.afterImageUrl && (
                        <div>
                            <p className="text-sm text-center mb-1 text-gray-400">After</p>
                            <img src={selectedTrade.afterImageUrl} alt="After trade" className="rounded-lg max-h-48" />
                        </div>
                    )}
                </div>
            </Card>
        )}
        
        <Card>
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            {analysis ? (
              <div className="prose prose-invert max-w-none dark:prose-p:text-dark-text prose-p:text-light-text prose-headings:text-primary">
                 <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            ) : (
              <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait">
                {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            )}
        </Card>

        <div className="flex gap-4 pt-4">
            <button onClick={handleEdit} className="w-full bg-blue-500/20 text-blue-500 font-bold py-2 px-4 rounded-lg hover:bg-blue-500/30 transition-colors">
              Edit
            </button>
            <button onClick={handleDelete} className="w-full bg-red-500/20 text-red-500 font-bold py-2 px-4 rounded-lg hover:bg-red-500/30 transition-colors">
              Delete
            </button>
        </div>

      </div>
    );
  }
  
  if (!selectedTrade && !tradeToEdit) {
    const inputClasses = "w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm";
    const selectClasses = `${inputClasses} appearance-none`;
    const commonButtonClasses = "px-3 py-1 text-sm rounded-full transition-colors focus:outline-none";
    const activeButtonClasses = "bg-primary text-white";
    const inactiveButtonClasses = "bg-light-bg dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600";

    return (
      <>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">All Trades</h2>
          
          <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button 
                    onClick={handleDownloadCSV} 
                    className="p-2 rounded-full text-primary hover:bg-primary/20 transition-colors"
                    aria-label="Download filtered trades as CSV"
                >
                    <DownloadIcon />
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => handleFilterPeriodChange('all')} className={`${commonButtonClasses} ${filterPeriod === 'all' ? activeButtonClasses : inactiveButtonClasses}`}>All Time</button>
                <button onClick={() => handleFilterPeriodChange('today')} className={`${commonButtonClasses} ${filterPeriod === 'today' ? activeButtonClasses : inactiveButtonClasses}`}>Today</button>
                <button onClick={() => handleFilterPeriodChange('week')} className={`${commonButtonClasses} ${filterPeriod === 'week' ? activeButtonClasses : inactiveButtonClasses}`}>This Week</button>
                <button onClick={() => handleFilterPeriodChange('month')} className={`${commonButtonClasses} ${filterPeriod === 'month' ? activeButtonClasses : inactiveButtonClasses}`}>This Month</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  {tradesOnDate.map(trade => (
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