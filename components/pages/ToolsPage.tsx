import React, { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import PositionSizeCalculator from '../tools/PositionSizeCalculator';
import RiskRewardCalculator from '../tools/RiskRewardCalculator';
import MotivationQuote from '../tools/MotivationQuote';
import BreakReminder from '../tools/BreakReminder';
import ComingSoon from '../tools/ComingSoon';
import Card from '../common/Card';

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
const QuoteIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const TradeReviewIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const CorrelationIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const EmotionIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BreakReminderIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const GoalTrackerIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M12 12l-6.75 4.5M12 12l6.75 4.5" /></svg>;

const tools = [
    { id: 'pos-size', title: 'Position Size', description: 'Calculate lot size based on your risk.', icon: <PositionSizeIcon />, component: <PositionSizeCalculator /> },
    { id: 'rr-ratio', title: 'Risk/Reward Ratio', description: 'Calculate the R/R ratio for a trade.', icon: <RiskRewardIcon />, component: <RiskRewardCalculator /> },
    { id: 'motivation', title: 'Motivation Quotes', description: 'Get a dose of trading wisdom.', icon: <QuoteIcon />, component: <MotivationQuote /> },
    { id: 'break-reminder', title: 'Break Reminder', description: 'Set a timer to take screen breaks.', icon: <BreakReminderIcon />, component: <BreakReminder /> },
    { id: 'trade-review', title: 'Trade Review', description: 'Review trades and note lessons learned.', icon: <TradeReviewIcon />, component: <ComingSoon title="Trade Review Tool" /> },
    { id: 'correlation', title: 'Correlation Checker', description: 'Compare pairs to find correlation.', icon: <CorrelationIcon />, component: <ComingSoon title="Correlation Checker" /> },
    { id: 'emotion-tracker', title: 'Emotion Tracker', description: 'Log emotions before and after trades.', icon: <EmotionIcon />, component: <ComingSoon title="Emotion Tracker" /> },
    { id: 'goal-tracker', title: 'Goal Tracker', description: 'Set and track weekly/monthly goals.', icon: <GoalTrackerIcon />, component: <ComingSoon title="Goal Tracker" /> },
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