import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { Trade } from '../types';
import * as tradeService from '../services/tradeService';

// Define the shape of the context data
interface TradesContextType {
  trades: Trade[];
  loading: boolean;
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  updateTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => void;
  refreshTrades: () => void;
}

// Create the context
const TradesContext = createContext<TradesContextType | undefined>(undefined);

// Create the Provider component
export const TradesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTrades = useCallback(() => {
    setLoading(true);
    const fetchedTrades = tradeService.getTrades();
    fetchedTrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTrades(fetchedTrades);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshTrades();
  }, [refreshTrades]);

  const addTrade = useCallback((trade: Omit<Trade, 'id'>) => {
    tradeService.addTrade(trade);
    refreshTrades();
  }, [refreshTrades]);

  const updateTrade = useCallback((trade: Trade) => {
    tradeService.updateTrade(trade);
    refreshTrades();
  }, [refreshTrades]);

  const deleteTrade = useCallback((id: string) => {
    tradeService.deleteTrade(id);
    refreshTrades();
  }, [refreshTrades]);

  // FIX: Memoize the context value to prevent unnecessary re-renders of consumer components.
  const value = useMemo(() => ({ 
    trades, 
    loading, 
    addTrade, 
    updateTrade, 
    deleteTrade, 
    refreshTrades 
  }), [trades, loading, addTrade, updateTrade, deleteTrade, refreshTrades]);

  // FIX: Replaced JSX with React.createElement to be compatible with a .ts file.
  return React.createElement(TradesContext.Provider, { value }, children);
};

// Create the custom hook to use the context
export const useTrades = (): TradesContextType => {
  const context = useContext(TradesContext);
  if (context === undefined) {
    throw new Error('useTrades must be used within a TradesProvider');
  }
  return context;
};
