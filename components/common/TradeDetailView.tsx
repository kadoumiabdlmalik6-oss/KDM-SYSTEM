import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Trade } from '../../types';
import Card from './Card';
import StarRating from './StarRating';
import { analyzeTradeWithGemini } from '../../geminiService';

interface TradeDetailViewProps {
  trade: Trade;
  onBack: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
}

const TradeDetailView: React.FC<TradeDetailViewProps> = ({ trade, onBack, onEdit, onDelete }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!trade) return;
    setIsAnalyzing(true);
    setAnalysis('');
    const result = await analyzeTradeWithGemini(trade);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleConfirmDelete = () => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
        onDelete(trade.id);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-primary font-semibold">&larr; Back</button>
      </div>

      <Card>
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">{trade.pair}</h2>
          <div className={`px-3 py-1 text-sm font-semibold rounded-full ${trade.type === 'buy' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {trade.type.toUpperCase()}
          </div>
        </div>
        <div className="mt-2 text-gray-400 text-sm">
          {new Date(trade.date).toLocaleString()} &bull; {trade.session}
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm text-gray-400">Result</h4>
            <p className={`text-lg font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
            </p>
          </div>
          <div>
            <h4 className="text-sm text-gray-400">Risk/Reward</h4>
            <p className="text-lg font-bold">1:{trade.rr}</p>
          </div>
          {trade.entryPrice && <div><h4 className="text-sm text-gray-400">Entry</h4><p>{trade.entryPrice}</p></div>}
          {trade.exitPrice && <div><h4 className="text-sm text-gray-400">Exit</h4><p>{trade.exitPrice}</p></div>}
        </div>
        <div className="mt-4">
          <h4 className="text-sm text-gray-400 mb-1">Rating</h4>
          <StarRating rating={trade.rating} />
        </div>
      </Card>

      {trade.notes && (
        <Card>
          <h4 className="font-semibold mb-2">Notes</h4>
          <p className="text-gray-300 whitespace-pre-wrap">{trade.notes}</p>
        </Card>
      )}

      {(trade.beforeImageUrl || trade.afterImageUrl) && (
        <Card>
          <h4 className="font-semibold mb-2">Attachments</h4>
          <div className="flex gap-4">
            {trade.beforeImageUrl && (
              <div>
                <p className="text-sm text-center mb-1 text-gray-400">Before</p>
                <img onClick={() => setZoomedImage(trade.beforeImageUrl!)} src={trade.beforeImageUrl} alt="Before trade" className="rounded-lg max-h-48 cursor-pointer hover:opacity-80 transition-opacity" />
              </div>
            )}
            {trade.afterImageUrl && (
              <div>
                <p className="text-sm text-center mb-1 text-gray-400">After</p>
                <img onClick={() => setZoomedImage(trade.afterImageUrl!)} src={trade.afterImageUrl} alt="After trade" className="rounded-lg max-h-48 cursor-pointer hover:opacity-80 transition-opacity" />
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
        <button onClick={() => onEdit(trade)} className="w-full bg-blue-500/20 text-blue-500 font-bold py-2 px-4 rounded-lg hover:bg-blue-500/30 transition-colors">
          Edit
        </button>
        <button onClick={handleConfirmDelete} className="w-full bg-red-500/20 text-red-500 font-bold py-2 px-4 rounded-lg hover:bg-red-500/30 transition-colors">
          Delete
        </button>
      </div>

      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Zoomed trade attachment"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default TradeDetailView;
