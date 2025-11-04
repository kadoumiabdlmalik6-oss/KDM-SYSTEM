import React, { useState, useEffect, useRef } from 'react';
import Card from '../common/Card';

const BreakReminder: React.FC = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive) {
            timerRef.current = window.setInterval(() => {
                if (seconds > 0) {
                    setSeconds(s => s - 1);
                } else if (minutes > 0) {
                    setMinutes(m => m - 1);
                    setSeconds(59);
                } else { // Timer finished
                    setIsActive(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                    // Add a notification or sound effect here in a real app
                    alert("Time for a break!"); 
                    setMinutes(25); // Reset
                    setSeconds(0);
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, seconds, minutes]);

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        setIsActive(false);
        setMinutes(25);
        setSeconds(0);
    };
    
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Break Reminder</h3>
            <Card className="text-center">
                <p className="text-7xl font-bold tracking-tighter text-primary">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
                <p className="text-gray-400">Set a timer to take a screen break.</p>
            </Card>
             <div className="flex gap-4">
                <button onClick={toggleTimer} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity">
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer} className="w-full bg-gray-500/20 text-gray-500 font-bold py-3 px-4 rounded-lg hover:bg-gray-500/30 transition-colors">
                    Reset
                </button>
            </div>
        </div>
    )
};
export default BreakReminder;