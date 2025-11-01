import React from 'react';
import { Trade } from '../../types';
import Card from './Card';
import StarRating from './StarRating';

interface TradeListItemProps {
    trade: Trade;
    onClick: () => void;
}

const TradeListItem: React.FC<TradeListItemProps> = ({ trade, onClick }) => {
    const profitLoss = trade.pnl;
    return (
        <Card onClick={onClick} className="mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">{trade.pair}</h3>
                    <p className="text-sm text-gray-400">{new Date(trade.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <p className={`font-bold text-lg ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
                    </p>
                    <StarRating rating={trade.rating} />
                </div>
            </div>
            <div className="mt-2 flex justify-between items-center">
                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${trade.type === 'buy' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {trade.type.toUpperCase()}
                </span>
                <span className="text-sm text-gray-400">RR: 1:{trade.rr}</span>
            </div>
        </Card>
    );
};

export default TradeListItem;
