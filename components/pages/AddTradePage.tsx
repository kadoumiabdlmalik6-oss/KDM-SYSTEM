import React, { useState, useEffect } from 'react';
import { Page, Trade } from '../../types';
import { useTrades } from '../../hooks/useTrades';
import { useAccounts } from '../../hooks/useAccounts';

interface AddTradePageProps {
  navigate: (page: Page) => void;
  tradeToEdit?: Trade;
  onClose?: () => void;
}

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button type="button" key={ratingValue} onClick={() => setRating(ratingValue)} className="focus:outline-none" >
            <svg className={`w-8 h-8 ${ratingValue <= rating ? 'text-primary' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20" >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.368-2.447a1 1 0 00-1.176 0l-3.368 2.447c-.783.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.062 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const PRESET_PAIRS = ['XAUUSD', 'BTCUSD', 'EURUSD', 'GBPUSD'];

const AddTradePage: React.FC<AddTradePageProps> = ({ navigate, tradeToEdit, onClose }) => {
  const { addTrade, updateTrade } = useTrades();
  const { accounts } = useAccounts();
  
  const [accountId, setAccountId] = useState('');
  const [pair, setPair] = useState(PRESET_PAIRS[0]);
  const [customPair, setCustomPair] = useState('');
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [session, setSession] = useState('New York');
  const [outcome, setOutcome] = useState<'win' | 'loss' | 'break-even'>('win');
  const [pnlAmount, setPnlAmount] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [rr, setRr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [beforeImage, setBeforeImage] = useState<string | undefined>(undefined);
  const [afterImage, setAfterImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!tradeToEdit && accounts.length > 0 && !accountId) {
      const nonDefaultAccounts = accounts.filter(a => a.id !== 'default');
      if (nonDefaultAccounts.length > 0) {
        setAccountId(nonDefaultAccounts[0].id);
      } else if (accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    }
  }, [accounts, tradeToEdit, accountId]);

  useEffect(() => {
    if (tradeToEdit) {
      setAccountId(tradeToEdit.accountId);
      if (PRESET_PAIRS.includes(tradeToEdit.pair)) {
        setPair(tradeToEdit.pair);
      } else {
        setPair('Other');
        setCustomPair(tradeToEdit.pair);
      }
      setType(tradeToEdit.type);
      setSession(tradeToEdit.session);
      if (tradeToEdit.pnl > 0) {
        setOutcome('win');
      } else if (tradeToEdit.pnl < 0) {
        setOutcome('loss');
      } else {
        setOutcome('break-even');
      }
      setPnlAmount(Math.abs(tradeToEdit.pnl).toString());
      setEntryPrice(tradeToEdit.entryPrice?.toString() || '');
      setExitPrice(tradeToEdit.exitPrice?.toString() || '');
      setRr(tradeToEdit.rr.toString());
      const tradeDate = new Date(tradeToEdit.date);
      setDate(tradeDate.toISOString().split('T')[0]);
      setTime(tradeDate.toTimeString().slice(0, 5));
      setNotes(tradeToEdit.notes);
      setRating(tradeToEdit.rating);
      setBeforeImage(tradeToEdit.beforeImageUrl);
      setAfterImage(tradeToEdit.afterImageUrl);
    }
  }, [tradeToEdit]);

  useEffect(() => {
    if (outcome === 'break-even') {
        setPnlAmount('0');
    }
  }, [outcome]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageSetter: (url: string) => void) => {
      if (e.target.files && e.target.files[0]) {
          const base64 = await fileToBase64(e.target.files[0]);
          imageSetter(base64);
      }
  }

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(Page.Trades);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPair = pair === 'Other' ? customPair.toUpperCase() : pair;
    if (!finalPair || (pnlAmount === '' && outcome !== 'break-even') || rating === 0 || !rr || !accountId) {
      alert('Please fill all required fields: Account, Pair, Amount, RR, and Rating.');
      return;
    }

    const finalPnl = outcome === 'win' 
        ? parseFloat(pnlAmount) 
        : outcome === 'loss'
            ? -parseFloat(pnlAmount)
            : 0;

    const tradeData = {
      accountId,
      pair: finalPair,
      type,
      session,
      pnl: finalPnl,
      entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
      exitPrice: exitPrice ? parseFloat(exitPrice) : undefined,
      rr: parseFloat(rr),
      date: new Date(`${date}T${time}`).toISOString(),
      notes,
      rating,
      beforeImageUrl: beforeImage,
      afterImageUrl: afterImage,
    };

    if (tradeToEdit) {
      await updateTrade({ ...tradeData, id: tradeToEdit.id });
    } else {
      await addTrade(tradeData);
    }
    
    handleClose();
  };
  
  const inputClasses = "w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";
  const selectClasses = `${inputClasses} appearance-none`;

  const visibleAccounts = accounts.filter(acc => acc.id !== 'default');

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{tradeToEdit ? 'Edit Trade' : 'Add New Trade'}</h2>
        <button 
            onClick={handleClose} 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
            <label className="block mb-1 font-medium">Account</label>
            <select value={accountId} onChange={e => setAccountId(e.target.value)} className={selectClasses} required>
                <option value="" disabled>Select an account</option>
                {visibleAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium">Trading Pair</label>
            <div className="flex gap-4">
                <select value={pair} onChange={e => setPair(e.target.value)} className={selectClasses} required>
                    {PRESET_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                    <option value="Other">Other...</option>
                </select>
                {pair === 'Other' && (
                    <input type="text" value={customPair} onChange={e => setCustomPair(e.target.value)} placeholder="e.g., SOLUSD" className={inputClasses} required />
                )}
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block mb-1 font-medium">Type</label>
                <select value={type} onChange={e => setType(e.target.value as 'buy' | 'sell')} className={selectClasses}>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                </select>
            </div>
            <div>
                <label className="block mb-1 font-medium">Session</label>
                <select value={session} onChange={e => setSession(e.target.value)} className={selectClasses}>
                    <option>Asia</option>
                    <option>London</option>
                    <option>New York</option>
                </select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block mb-1 font-medium">Entry Price</label>
                <input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="Optional" className={inputClasses} />
            </div>
            <div>
                <label className="block mb-1 font-medium">Exit Price</label>
                <input type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="Optional" className={inputClasses} />
            </div>
        </div>

        <div>
            <label className="block mb-1 font-medium">Result</label>
            <div className="grid grid-cols-3 gap-2">
                <select value={outcome} onChange={e => setOutcome(e.target.value as 'win' | 'loss' | 'break-even')} className={selectClasses}>
                    <option value="win">Win</option>
                    <option value="loss">Loss</option>
                    <option value="break-even">Break even</option>
                </select>
                <input 
                    type="number" 
                    step="any" 
                    value={pnlAmount} 
                    onChange={e => setPnlAmount(e.target.value)} 
                    placeholder="P/L ($)" 
                    className={inputClasses} 
                    required={outcome !== 'break-even'}
                    disabled={outcome === 'break-even'}
                />
                <input type="number" step="any" value={rr} onChange={e => setRr(e.target.value)} placeholder="RR" className={inputClasses} required />
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block mb-1 font-medium">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required />
            </div>
            <div>
                <label className="block mb-1 font-medium">Entry Time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputClasses} required />
            </div>
        </div>
        
        <div>
          <label className="block mb-1 font-medium">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Why did you take this trade?" className={inputClasses} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block mb-1 font-medium">Before Trade Image</label>
                <label htmlFor="before-image-upload" className="cursor-pointer inline-block text-sm py-2 px-4 rounded-full border-0 font-semibold bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                    Upload Image
                </label>
                <input id="before-image-upload" type="file" accept="image/*" onChange={e => handleImageUpload(e, setBeforeImage)} className="hidden" />
                {beforeImage && <img src={beforeImage} alt="Before trade" className="mt-2 rounded-lg h-20 w-auto" />}
            </div>
            <div>
                <label className="block mb-1 font-medium">After Trade Image</label>
                <label htmlFor="after-image-upload" className="cursor-pointer inline-block text-sm py-2 px-4 rounded-full border-0 font-semibold bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                    Upload Image
                </label>
                <input id="after-image-upload" type="file" accept="image/*" onChange={e => handleImageUpload(e, setAfterImage)} className="hidden" />
                {afterImage && <img src={afterImage} alt="After trade" className="mt-2 rounded-lg h-20 w-auto" />}
            </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Rating</label>
          <StarRatingInput rating={rating} setRating={setRating} />
        </div>

        <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity">
          {tradeToEdit ? 'Update Trade' : 'Save Trade'}
        </button>
      </form>
    </div>
  );
};

export default AddTradePage;
