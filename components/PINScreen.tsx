import React, { useState, useRef, useEffect } from 'react';

interface PINScreenProps {
  onPinSuccess: () => void;
}

const PIN_STORAGE_KEY = 'kdm_journal_pin';

const PINScreen: React.FC<PINScreenProps> = ({ onPinSuccess }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<'create' | 'confirm' | 'enter'>('enter');
  const [tempPin, setTempPin] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedPin = localStorage.getItem(PIN_STORAGE_KEY);
    if (savedPin) {
      setMode('enter');
      setTitle('أدخل رمز PIN المكون من 4 أرقام');
    } else {
      setMode('create');
      setTitle('أنشئ رمز PIN مكون من 4 أرقام');
    }
    inputRefs.current[0]?.focus();
  }, []);

  const resetPinInput = (focusFirst = true) => {
    setPin(['', '', '', '']);
    if (focusFirst) {
      inputRefs.current[0]?.focus();
    }
  };

  const handlePinComplete = (completedPin: string) => {
    setError('');
    switch (mode) {
      case 'create':
        setTempPin(completedPin);
        setMode('confirm');
        setTitle('قم بتأكيد رمز PIN الخاص بك');
        resetPinInput();
        break;

      case 'confirm':
        if (completedPin === tempPin) {
          localStorage.setItem(PIN_STORAGE_KEY, tempPin!);
          onPinSuccess();
        } else {
          setError('رموز PIN غير متطابقة. الرجاء البدء من جديد.');
          if (navigator.vibrate) navigator.vibrate(200);
          setTimeout(() => {
            setError('');
            setMode('create');
            setTitle('أنشئ رمز PIN مكون من 4 أرقام');
            setTempPin(null);
            resetPinInput();
          }, 1500);
        }
        break;

      case 'enter':
        const savedPin = localStorage.getItem(PIN_STORAGE_KEY);
        if (completedPin === savedPin) {
          onPinSuccess();
        } else {
          setError('رمز PIN غير صحيح. يرجى المحاولة مرة أخرى.');
          if (navigator.vibrate) navigator.vibrate(200);
          setTimeout(() => {
            setError('');
            resetPinInput();
          }, 1000);
        }
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    
    const completedPin = newPin.join('');
    if (completedPin.length === 4) {
      // Use a brief timeout to allow the last digit to render before processing
      setTimeout(() => handlePinComplete(completedPin), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      <div className="text-center p-8 max-w-sm w-full">
        <h1 className="text-3xl font-bold text-primary mb-2">
          KDM JOURNAL
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{title}</p>

        <div className="flex justify-center space-x-3 mb-4" aria-label="PIN input" dir="ltr">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-14 h-16 text-center text-3xl font-bold bg-light-card dark:bg-dark-card border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ caretColor: 'transparent', WebkitTextSecurity: 'disc' } as React.CSSProperties}
              autoComplete="one-time-code"
              aria-label={`PIN digit ${index + 1}`}
            />
          ))}
        </div>
        
        {error && <p className="text-red-500 mt-4 animate-shake" role="alert">{error}</p>}
      </div>
       <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PINScreen;
