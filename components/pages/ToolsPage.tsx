import React, { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import PositionSizeCalculator from '../tools/PositionSizeCalculator';
import RiskRewardCalculator from '../tools/RiskRewardCalculator';

// BackButton component defined locally for simplicity
const BackButton: React.FC<{ onClick: () => void, text?: string }> = ({ onClick, text = "All Tools" }) => (
    <button onClick={onClick} className="text-primary font-semibold mb-4 inline-flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {text}
    </button>
);

// Icon Components
const ICON_CLASS = "h-10 w-10";
const PositionSizeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.002 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.002 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const RiskRewardIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 3m0 0l3-3m-3 3v6l3 3m0-9l3-3m-3 3l3 3m0-9l3 3m6-6v.01M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const tools = [
    { id: 'pos-size', title: 'Position Size', description: 'Calculate lot size based on your risk.', icon: <PositionSizeIcon />, component: <PositionSizeCalculator /> },
    { id: 'rr-ratio', title: 'Risk/Reward Ratio', description: 'Calculate the R/R ratio for a trade.', icon: <RiskRewardIcon />, component: <RiskRewardCalculator /> },
];

const ToolsPage: React.FC = () => {
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTools = useMemo(() => {
        return tools.filter(tool => 
            tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const activeTool = tools.find(t => t.id === selectedTool);
    
    return (
        <div className="space-y-6">
            {!activeTool ? (
                <>
                    <h2 className="text-2xl font-semibold">Trading Tools</h2>
                    <p className="text-gray-400">Manage, analyze, and improve your trading.</p>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-3 pl-10 bg-light-card dark:bg-dark-card border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {filteredTools.map(tool => (
                            <ToolCard key={tool.id} title={tool.title} description={tool.description} icon={tool.icon} onClick={() => setSelectedTool(tool.id)} />
                        ))}
                         {filteredTools.length === 0 && (
                            <p className="col-span-2 text-center text-gray-400 py-8">No tools found for "{searchQuery}"</p>
                        )}
                    </div>
                </>
            ) : (
                <div>
                    <BackButton onClick={() => setSelectedTool(null)} />
                    {activeTool.component}
                </div>
            )}
        </div>
    );
};

export default ToolsPage;