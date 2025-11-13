import React, { useState, useEffect } from 'react';
import Card from '../common/Card';

interface Goal {
  id: string;
  text: string;
  progress: number; // 0-100
}

type GoalType = 'daily' | 'weekly' | 'monthly';

const GOAL_STORAGE_KEYS: Record<GoalType, string> = {
    daily: 'kdm_journal_daily_goals',
    weekly: 'kdm_journal_weekly_goals',
    monthly: 'kdm_journal_monthly_goals',
};

// A reusable component for a single goal list
const GoalList: React.FC<{ title: string; goalType: GoalType }> = ({ title, goalType }) => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoalText, setNewGoalText] = useState('');

    // Load goals from local storage on mount
    useEffect(() => {
        try {
            const savedGoals = localStorage.getItem(GOAL_STORAGE_KEYS[goalType]);
            if (savedGoals) {
                setGoals(JSON.parse(savedGoals));
            }
        } catch (error) {
            console.error("Failed to load goals from local storage:", error);
            // If parsing fails, start with an empty list
            setGoals([]);
        }
    }, [goalType]);

    // Save goals to local storage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(GOAL_STORAGE_KEYS[goalType], JSON.stringify(goals));
        } catch (error) {
            console.error("Failed to save goals to local storage:", error);
        }
    }, [goals, goalType]);

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGoalText.trim() === '') return;
        const newGoal: Goal = {
            id: new Date().toISOString(),
            text: newGoalText.trim(),
            progress: 0,
        };
        setGoals([...goals, newGoal]);
        setNewGoalText('');
    };

    const handleUpdateProgress = (id: string, progress: number) => {
        setGoals(goals.map(goal => goal.id === id ? { ...goal, progress } : goal));
    };

    const handleDeleteGoal = (id: string) => {
        setGoals(goals.filter(goal => goal.id !== id));
    };
    
    const inputClasses = "flex-grow p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <Card>
            <h4 className="text-lg font-semibold mb-4">{title}</h4>
            <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    placeholder="Add a new goal..."
                    className={inputClasses}
                />
                <button type="submit" className="bg-primary text-white p-2 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0" aria-label="Add goal">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                    </svg>
                </button>
            </form>
            <div className="space-y-3">
                {goals.length > 0 ? goals.map(goal => (
                    <div key={goal.id} className="flex items-center gap-3 bg-light-bg dark:bg-dark-bg p-2 rounded-lg">
                        <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-500/70 hover:text-red-500 p-1 flex-shrink-0" aria-label={`Delete goal: ${goal.text}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                        <p className={`flex-grow ${goal.progress === 100 ? 'line-through text-gray-500' : ''}`}>{goal.text}</p>
                        <div className="flex items-center gap-2 w-40 flex-shrink-0">
                           <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={goal.progress}
                                onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                                style={{'--progress': `${goal.progress}%`} as React.CSSProperties}
                            />
                            <span className="text-sm font-semibold text-primary w-12 text-right">{goal.progress}%</span>
                        </div>
                    </div>
                )) : <p className="text-gray-400 text-center py-4">No goals yet. Add one!</p>}
            </div>
        </Card>
    );
}

const GoalTracker: React.FC = () => {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Goal Tracker</h3>
            <p className="text-gray-400">Set and track your trading objectives to stay focused and motivated.</p>
            <GoalList title="أهداف يومية" goalType="daily" />
            <GoalList title="أهداف أسبوعية" goalType="weekly" />
            <GoalList title="أهداف شهرية" goalType="monthly" />

            <style>{`
                .range-slider {
                    --progress: 50%;
                    background: linear-gradient(to right, #2563eb var(--progress), #e5e7eb var(--progress));
                }
                .dark .range-slider {
                    background: linear-gradient(to right, #2563eb var(--progress), #374151 var(--progress));
                }
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #2563eb;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid white;
                }
                .dark .range-slider::-webkit-slider-thumb {
                    border-color: #1a1a1a;
                }
                .range-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #2563eb;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid white;
                }
                .dark .range-slider::-moz-range-thumb {
                    border-color: #1a1a1a;
                }
            `}</style>
        </div>
    );
};

export default GoalTracker;
