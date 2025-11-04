import React, { useState, useMemo } from 'react';
import Card from '../common/Card';

const RiskRewardCalculator: React.FC = () => {
    const [entryPrice, setEntryPrice] = useState('');
    const [stopLossPrice, setStopLossPrice] = useState('');
    const [takeProfitPrice, setTakeProfitPrice] = useState('');
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

    const result = useMemo(() => {
        const entry = parseFloat(entryPrice);
        const sl = parseFloat(stopLossPrice);
        const tp = parseFloat(takeProfitPrice);

        if (isNaN(entry) || isNaN(sl) || isNaN(tp) || entry <= 0 || sl <= 0 || tp <= 0) {
            return null;
        }

        let risk, reward;
        if (tradeType === 'buy') {
            risk = entry - sl;
            reward = tp - entry;
        } else { // sell
            risk = sl - entry;
            reward = entry - tp;
        }

        if (risk <= 0 || reward <= 0) {
            return { ratio: 0, risk: 0, reward: 0, error: "Invalid prices for the selected trade type." };
        }
        
        const ratio = reward / risk;

        return {
            ratio: ratio.toFixed(2),
            risk: risk.toPrecision(5),
            reward: reward.toPrecision(5)
        };
    }, [entryPrice, stopLossPrice, takeProfitPrice, tradeType]);
    
    const inputClasses = "w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";
    const selectClasses = `${inputClasses} appearance-none`;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Risk/Reward Ratio Calculator</h3>
            <Card>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Trade Type</label>
                        <select value={tradeType} onChange={e => setTradeType(e.target.value as 'buy' | 'sell')} className={selectClasses}>
                            <option value="buy">Buy (Long)</option>
                            <option value="sell">Sell (Short)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Entry Price</label>
                        <input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className={inputClasses} placeholder="e.g., 1.07500" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Stop Loss Price</label>
                        <input type="number" step="any" value={stopLossPrice} onChange={e => setStopLossPrice(e.target.value)} className={inputClasses} placeholder="e.g., 1.07400" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Take Profit Price</label>
                        <input type="number" step="any" value={takeProfitPrice} onChange={e => setTakeProfitPrice(e.target.value)} className={inputClasses} placeholder="e.g., 1.07800" />
                    </div>
                </div>
            </Card>
            {result && (
                <Card className="bg-primary/10">
                    <h4 className="text-lg font-semibold mb-2">Calculation Result</h4>
                    {result.error ? (
                         <p className="text-center text-red-500">{result.error}</p>
                    ) : (
                        <div className="text-center space-y-2">
                             <p>Your potential <span className="font-bold text-green-500">reward</span> is {result.reward} vs a potential <span className="font-bold text-red-500">risk</span> of {result.risk}.</p>
                            <p className="text-2xl font-bold">Risk/Reward Ratio: <span className="text-primary">1 : {result.ratio}</span></p>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};
export default RiskRewardCalculator;