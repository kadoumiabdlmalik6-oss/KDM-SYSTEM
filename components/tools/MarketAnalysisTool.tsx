import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Card from '../common/Card';
import { analyzeMarketWithGemini } from '../../geminiService';

const PRESET_PAIRS = ['XAUUSD', 'BTCUSD', 'EURUSD', 'GBPUSD'];

const MarketAnalysisTool: React.FC = () => {
    const [pair, setPair] = useState('');
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const performAnalysis = async (pairToAnalyze: string) => {
        if (!pairToAnalyze) {
            setError('Please enter a trading pair.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysis(''); // Clear previous analysis

        try {
            const result = await analyzeMarketWithGemini(pairToAnalyze.toUpperCase());
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMainAnalyzeClick = () => {
        performAnalysis(pair);
    };

    const handlePresetClick = (preset: string) => {
        setPair(preset);
        performAnalysis(preset);
    };

    const inputClasses = "w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Market Analysis</h3>
            <Card>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-2 font-medium">Trading Pair</label>
                        <div className="flex gap-2">
                             <input 
                                type="text" 
                                value={pair} 
                                onChange={e => setPair(e.target.value)} 
                                placeholder="e.g., XAUUSD, BTCUSD..."
                                className={inputClasses} 
                            />
                            <button onClick={handleMainAnalyzeClick} disabled={isLoading} className="bg-primary text-white font-bold p-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait">
                                {isLoading ? (
                                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                )}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {PRESET_PAIRS.map(p => (
                                <button key={p} onClick={() => handlePresetClick(p)} className="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {error && <Card className="border-red-500/50 bg-red-500/10 text-red-500 text-center">{error}</Card>}

            {isLoading && (
                <Card className="text-center p-8">
                    <p className="animate-pulse text-lg">Generating AI market analysis for {pair.toUpperCase()}...</p>
                </Card>
            )}

            {analysis && (
                <Card>
                    <h4 className="text-lg font-semibold mb-2">Analysis for {pair.toUpperCase()}</h4>
                    <div className="prose prose-invert max-w-none dark:prose-p:text-dark-text prose-p:text-light-text prose-headings:text-primary">
                        <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                </Card>
            )}

             {!isLoading && !analysis && !error && (
                <Card className="text-center p-12 text-gray-400">
                    <p>Enter a trading pair to get started.</p>
                </Card>
            )}
        </div>
    );
};

export default MarketAnalysisTool;