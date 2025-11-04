import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import { getMotivationQuote } from '../../geminiService';

const MotivationQuote: React.FC = () => {
    const [quote, setQuote] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchQuote = useCallback(async () => {
        setLoading(true);
        const newQuote = await getMotivationQuote();
        setQuote(newQuote);
        setLoading(false);
    }, []);
    
    useEffect(() => {
        fetchQuote();
    }, [fetchQuote]);

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Motivation Quote</h3>
            <Card className="flex flex-col items-center justify-center text-center min-h-[200px]">
                {loading ? (
                     <div className="animate-pulse text-gray-400">Fetching wisdom...</div>
                ) : (
                    <blockquote className="text-2xl italic text-light-text dark:text-dark-text">
                        {quote}
                    </blockquote>
                )}
            </Card>
            <button onClick={fetchQuote} disabled={loading} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? 'Thinking...' : 'Get New Quote'}
            </button>
        </div>
    );
};
export default MotivationQuote;