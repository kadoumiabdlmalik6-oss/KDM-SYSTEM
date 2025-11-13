import React, { useState, useEffect, useMemo } from 'react';
import Card from '../common/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Define types for clarity
interface TradeLogEntry {
  tradeNumber: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  outcome: 'win' | 'loss';
}

interface BacktestResult {
  id: string;
  params: {
    timeframe: string;
    session: string;
    tradeType: 'Buy' | 'Sell';
    riskRewardRatio: string;
    stopLossPips: string;
  };
  metrics: {
    pnlPercent: number;
    tradeCount: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    avgWin: number;
    avgLoss: number;
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;
  };
  equityCurve: { trade: number; equity: number }[];
  tradeLog: TradeLogEntry[];
}

const STORAGE_KEY = 'kdm_journal_backtests';

const BacktestingTool: React.FC = () => {
    // Form state
    const [timeframe, setTimeframe] = useState('1D');
    const [tradeType, setTradeType] = useState<'Buy' | 'Sell'>('Buy');
    const [riskRewardRatio, setRiskRewardRatio] = useState('2');
    const [stopLossPips, setStopLossPips] = useState('20');
    const [session, setSession] = useState('All');

    // App state
    const [isBacktesting, setIsBacktesting] = useState(false);
    const [currentResult, setCurrentResult] = useState<BacktestResult | null>(null);
    const [savedResults, setSavedResults] = useState<BacktestResult[]>([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setSavedResults(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Failed to load backtest results:", error);
        }
    }, []);

    const runBacktest = () => {
        if (!riskRewardRatio || !stopLossPips) {
            alert('Please fill all required fields.');
            return;
        }
        setIsBacktesting(true);
        setCurrentResult(null);

        // Simulate a more advanced backtest
        setTimeout(() => {
            const rr = parseFloat(riskRewardRatio);
            const slPipsValue = parseFloat(stopLossPips);
            
            // 1. Generate a mock price series to simulate history
            const priceSeries: number[] = [];
            let currentPrice = 10000;
            for (let i = 0; i < 1000; i++) {
                currentPrice += (Math.random() - 0.5) * (slPipsValue * 0.5);
                priceSeries.push(currentPrice);
            }

            // 2. Simulate trades
            const trades: { result: 'win' | 'loss', pnl: number }[] = [];
            const tradeLog: TradeLogEntry[] = [];
            let consecutiveWins = 0, maxConsecutiveWins = 0;
            let consecutiveLosses = 0, maxConsecutiveLosses = 0;
            let grossProfit = 0, grossLoss = 0;
            let equity = 10000;
            const equityCurve = [{ trade: 0, equity: 10000 }];
            let peakEquity = 10000;
            let maxDrawdown = 0;

            for (let i = 1; i < priceSeries.length - 20; i++) {
                // Randomly trigger a trade signal
                if (Math.random() < 0.05) {
                    if (session !== 'All' && Math.random() > 0.33) continue;

                    const entryPrice = priceSeries[i];
                    const riskAmount = slPipsValue;
                    const rewardAmount = riskAmount * rr;
                    
                    const slPrice = tradeType === 'Buy' ? entryPrice - slPipsValue : entryPrice + slPipsValue;
                    const tpPrice = tradeType === 'Buy' ? entryPrice + rewardAmount : entryPrice - rewardAmount;

                    let outcome: 'win' | 'loss' | null = null;
                    let exitPrice: number | null = null;
                    for (let j = i + 1; j < priceSeries.length; j++) {
                        const futurePrice = priceSeries[j];
                        if (tradeType === 'Buy') {
                            if (futurePrice <= slPrice) { outcome = 'loss'; exitPrice = slPrice; break; }
                            if (futurePrice >= tpPrice) { outcome = 'win'; exitPrice = tpPrice; break; }
                        } else {
                            if (futurePrice >= slPrice) { outcome = 'loss'; exitPrice = slPrice; break; }
                            if (futurePrice <= tpPrice) { outcome = 'win'; exitPrice = tpPrice; break; }
                        }
                    }

                    if (outcome && exitPrice !== null) {
                        const pnl = outcome === 'win' ? rewardAmount : -riskAmount;
                        trades.push({ result: outcome, pnl });

                        tradeLog.push({
                            tradeNumber: trades.length,
                            entryPrice,
                            exitPrice,
                            pnl,
                            outcome,
                        });

                        equity += pnl;
                        equityCurve.push({ trade: trades.length, equity });
                        
                        if (outcome === 'win') {
                            grossProfit += rewardAmount;
                            consecutiveWins++;
                            consecutiveLosses = 0;
                            maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWins);
                        } else {
                            grossLoss += riskAmount;
                            consecutiveLosses++;
                            consecutiveWins = 0;
                            maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
                        }
                        
                        peakEquity = Math.max(peakEquity, equity);
                        const drawdown = ((peakEquity - equity) / peakEquity) * 100;
                        maxDrawdown = Math.max(maxDrawdown, drawdown);
                    }
                    i += 15; // Avoid overlapping trades
                }
            }

            // 3. Calculate final metrics
            if(trades.length < 1) {
                alert("No trades were generated with these parameters. Try different settings.");
                setIsBacktesting(false);
                return;
            }

            const winningTradesCount = trades.filter(t => t.result === 'win').length;
            const pnlPercent = ((equity - 10000) / 10000) * 100;

            const result: BacktestResult = {
                id: new Date().toISOString(),
                params: { timeframe, session, tradeType, riskRewardRatio, stopLossPips },
                metrics: {
                    pnlPercent,
                    tradeCount: trades.length,
                    winRate: (winningTradesCount / trades.length) * 100,
                    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : Infinity,
                    maxDrawdown,
                    avgWin: winningTradesCount > 0 ? grossProfit / winningTradesCount : 0,
                    avgLoss: (trades.length - winningTradesCount) > 0 ? grossLoss / (trades.length - winningTradesCount) : 0,
                    maxConsecutiveWins,
                    maxConsecutiveLosses,
                },
                equityCurve,
                tradeLog,
            };

            setCurrentResult(result);
            setIsBacktesting(false);
        }, 1500);
    };
    
    const saveResult = () => {
        if (!currentResult) return;
        const updatedResults = [currentResult, ...savedResults];
        setSavedResults(updatedResults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
        alert('Backtest result saved!');
    };

    const deleteResult = (id: string) => {
        const updatedResults = savedResults.filter(r => r.id !== id);
        setSavedResults(updatedResults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
        if (currentResult?.id === id) {
            setCurrentResult(null);
        }
    };

    const inputClasses = "w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";
    const selectClasses = `${inputClasses} appearance-none`;
    const labelClasses = "block mb-1 font-medium text-sm text-gray-500 dark:text-gray-400";
    
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Trading Backtesting</h3>
            
            <Card>
                <h4 className="font-semibold mb-4">Strategy Settings</h4>
                <div className="space-y-4">
                     <div>
                        <label className={labelClasses}>Timeframe</label>
                        <select value={timeframe} onChange={e => setTimeframe(e.target.value)} className={selectClasses}>
                            <option>15M</option>
                            <option>30M</option>
                            <option>1H</option>
                            <option>4H</option>
                            <option>1D</option>
                            <option>1W</option>
                        </select>
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className={labelClasses}>Trade Type</label>
                            <select value={tradeType} onChange={e => setTradeType(e.target.value as 'Buy' | 'Sell')} className={selectClasses}>
                                <option value="Buy">Buy (Long)</option>
                                <option value="Sell">Sell (Short)</option>
                            </select>
                        </div>
                        <div>
                           <label className={labelClasses}>Session</label>
                            <select value={session} onChange={e => setSession(e.target.value)} className={selectClasses}>
                                <option>All</option>
                                <option>Asia</option>
                                <option>London</option>
                                <option>New York</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Risk/Reward Ratio (1:X)</label>
                            <input type="number" step="0.1" value={riskRewardRatio} onChange={e => setRiskRewardRatio(e.target.value)} className={inputClasses} placeholder="e.g., 2" />
                        </div>
                        <div>
                           <label className={labelClasses}>Stop Loss (pips)</label>
                           <input type="number" value={stopLossPips} onChange={e => setStopLossPips(e.target.value)} className={inputClasses} placeholder="e.g., 20" />
                        </div>
                    </div>
                    <button onClick={runBacktest} disabled={isBacktesting} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait">
                         {isBacktesting ? 'Running Simulation...' : 'Run Backtest'}
                    </button>
                </div>
            </Card>

            {isBacktesting && <Card className="text-center p-8"><p className="animate-pulse text-lg">Simulating trades with historical data...</p></Card>}

            {currentResult && (
                <div className="space-y-4 animate-fade-in">
                    <Card>
                         <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-semibold">Backtest Result</h4>
                            <button onClick={saveResult} className="bg-blue-500/20 text-blue-500 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-500/30 transition-colors">Save Result</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                            <StatCard title="Total P/L" value={`${currentResult.metrics.pnlPercent.toFixed(2)}%`} isPositive={currentResult.metrics.pnlPercent >= 0} />
                            <StatCard title="Win Rate" value={`${currentResult.metrics.winRate.toFixed(2)}%`} />
                            <StatCard title="Profit Factor" value={isFinite(currentResult.metrics.profitFactor) ? currentResult.metrics.profitFactor.toFixed(2) : '∞'} isPositive={currentResult.metrics.profitFactor > 1} />
                            <StatCard title="Total Trades" value={currentResult.metrics.tradeCount.toString()} />
                            <StatCard title="Max Drawdown" value={`${currentResult.metrics.maxDrawdown.toFixed(2)}%`} isPositive={false} />
                            <StatCard title="Avg Win / Loss" value={`$${currentResult.metrics.avgWin.toFixed(0)} / $${currentResult.metrics.avgLoss.toFixed(0)}`} />
                            <StatCard title="Consecutive Wins" value={currentResult.metrics.maxConsecutiveWins.toString()} />
                            <StatCard title="Consecutive Losses" value={currentResult.metrics.maxConsecutiveLosses.toString()} />
                        </div>
                    </Card>

                    <Card>
                        <h4 className="text-lg font-semibold mb-4">Equity Curve</h4>
                        <div style={{ width: '100%', height: 200 }}>
                           <ResponsiveContainer>
                              <LineChart data={currentResult.equityCurve}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis dataKey="trade" name="Trade #" tick={{ fontSize: 10 }} stroke="grey" />
                                <YAxis tickFormatter={(tick) => `$${Math.round(tick).toLocaleString()}`} tick={{ fontSize: 10 }} stroke="grey" domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(30,30,30,0.8)', borderColor: '#2563eb' }} formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Line type="monotone" dataKey="equity" stroke="#2563eb" strokeWidth={2} dot={false} name="Account Equity"/>
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                    </Card>

                     <Card>
                        <h4 className="text-lg font-semibold mb-4">Trade Log</h4>
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 bg-light-card dark:bg-dark-card">
                                    <tr>
                                        <th className="p-2">#</th>
                                        <th className="p-2">Entry Price</th>
                                        <th className="p-2">Exit Price</th>
                                        <th className="p-2 text-right">P/L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentResult.tradeLog.map(trade => (
                                        <tr key={trade.tradeNumber} className="border-t border-gray-200 dark:border-gray-700">
                                            <td className="p-2">{trade.tradeNumber}</td>
                                            <td className="p-2">{trade.entryPrice.toFixed(2)}</td>
                                            <td className="p-2">{trade.exitPrice.toFixed(2)}</td>
                                            <td className={`p-2 text-right font-semibold ${trade.outcome === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                                                {trade.pnl.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
            
            {savedResults.length > 0 && (
                <Card>
                    <h4 className="text-lg font-semibold mb-4">Saved Backtests</h4>
                    <div className="space-y-4">
                        {savedResults.map(result => (
                             <button
                                key={result.id}
                                onClick={() => setCurrentResult(result)}
                                className="w-full text-left p-3 bg-light-bg dark:bg-dark-bg rounded-lg hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">Backtest ({result.params.timeframe} {result.params.tradeType})</p>
                                        <p className="text-xs text-gray-400">R/R 1:{result.params.riskRewardRatio} | SL: {result.params.stopLossPips} pips</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteResult(result.id); }}
                                        className="text-red-500/70 hover:text-red-500 p-1 flex-shrink-0"
                                        aria-label="Delete saved result"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                                    <p>P/L: <span className={result.metrics.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}>{result.metrics.pnlPercent.toFixed(2)}%</span></p>
                                    <p>Winrate: <span>{result.metrics.winRate.toFixed(1)}%</span></p>
                                    <p>Trades: <span>{result.metrics.tradeCount}</span></p>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>
            )}
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

const StatCard: React.FC<{title: string, value: string, isPositive?: boolean}> = ({ title, value, isPositive }) => {
    const valueColor = isPositive === undefined ? 'text-light-text dark:text-dark-text' : isPositive ? 'text-green-500' : 'text-red-500';
    return (
         <div className="p-2 bg-light-bg dark:bg-dark-bg rounded-lg">
            <h5 className="text-sm text-gray-400">{title}</h5>
            <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
        </div>
    )
}

export default BacktestingTool;