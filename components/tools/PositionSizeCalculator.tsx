import React, { useState, useMemo } from 'react';
import Card from '../common/Card';

const PositionSizeCalculator: React.FC = () => {
    const [accountBalance, setAccountBalance] = useState('10000');
    const [riskPercentage, setRiskPercentage] = useState('1');
    const [stopLossPips, setStopLossPips] = useState('20');
    const [pipValue, setPipValue] = useState('10'); // For a standard lot of EURUSD, for example

    const result = useMemo(() => {
        const balance = parseFloat(accountBalance);
        const risk = parseFloat(riskPercentage);
        const slPips = parseFloat(stopLossPips);
        const pValue = parseFloat(pipValue);

        if (isNaN(balance) || isNaN(risk) || isNaN(slPips) || isNaN(pValue) || balance <= 0 || risk <= 0 || slPips <= 0 || pValue <= 0) {
            return null;
        }

        const riskAmount = balance * (risk / 100);
        const stopLossAmount = slPips * pValue;
        const lotSize = riskAmount / stopLossAmount;

        return {
            riskAmount: riskAmount.toFixed(2),
            lotSize: lotSize.toFixed(2),
        };
    }, [accountBalance, riskPercentage, stopLossPips, pipValue]);
    
    const inputClasses = "w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <div className="space-y-4">
             <h3 className="text-xl font-semibold">Position Size Calculator</h3>
             <Card>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Account Balance ($)</label>
                        <input type="number" value={accountBalance} onChange={e => setAccountBalance(e.target.value)} className={inputClasses} />
                    </div>
                     <div>
                        <label className="block mb-1 font-medium">Risk per Trade (%)</label>
                        <input type="number" value={riskPercentage} onChange={e => setRiskPercentage(e.target.value)} className={inputClasses} />
                    </div>
                     <div>
                        <label className="block mb-1 font-medium">Stop Loss (pips)</label>
                        <input type="number" value={stopLossPips} onChange={e => setStopLossPips(e.target.value)} className={inputClasses} />
                    </div>
                     <div>
                        <label className="block mb-1 font-medium">Value per Pip ($ per lot)</label>
                        <input type="number" value={pipValue} onChange={e => setPipValue(e.target.value)} className={inputClasses} />
                    </div>
                </div>
             </Card>
             {result && (
                <Card className="bg-primary/10">
                    <h4 className="text-lg font-semibold mb-2">Calculation Result</h4>
                    <div className="text-center space-y-2">
                        <p>You can risk <span className="font-bold text-primary">${result.riskAmount}</span> on this trade.</p>
                        <p className="text-2xl font-bold">Recommended Lot Size: <span className="text-primary">{result.lotSize}</span></p>
                    </div>
                </Card>
             )}
        </div>
    );
};
export default PositionSizeCalculator;