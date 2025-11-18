import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { Trade } from '../types';
import * as tradeService from '../services/tradeService';

// Define the shape of the context data
interface TradesContextType {
  trades: Trade[];
  loading: boolean;
  addTrade: (trade: Omit<Trade, 'id'>) => Promise<void>;
  updateTrade: (trade: Trade) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  deleteTradesByAccountId: (accountId: string) => Promise<void>;
  refreshTrades: () => Promise<void>;
}

// Create the context
const TradesContext = createContext<TradesContextType | undefined>(undefined);

// Create the Provider component
export const TradesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTrades = useCallback(async () => {
    setLoading(true);
    try {
        const fetchedTrades = await tradeService.getTrades();
        fetchedTrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTrades(fetchedTrades);
    } catch (error) {
        console.error("Failed to fetch trades:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTrades();
  }, [refreshTrades]);

  const addTrade = useCallback(async (trade: Omit<Trade, 'id'>) => {
    await tradeService.addTrade(trade);
    await refreshTrades();
  }, [refreshTrades]);

  const updateTrade = useCallback(async (trade: Trade) => {
    await tradeService.updateTrade(trade);
    await refreshTrades();
  }, [refreshTrades]);

  const deleteTrade = useCallback(async (id: string) => {
    await tradeService.deleteTrade(id);
    await refreshTrades(); // Refresh to ensure consistency after deletion
  }, [refreshTrades]);
  
  const deleteTradesByAccountId = useCallback(async (accountId: string) => {
    await tradeService.deleteTradesByAccountId(accountId);
    await refreshTrades(); // Refresh to ensure consistency after deletion
  }, [refreshTrades]);

  const value = useMemo(() => ({ 
    trades, 
    loading, 
    addTrade, 
    updateTrade, 
    deleteTrade,
    deleteTradesByAccountId, 
    refreshTrades 
  }), [trades, loading, addTrade, updateTrade, deleteTrade, deleteTradesByAccountId, refreshTrades]);

  // FIX: Replaced JSX with React.createElement to be compatible with .ts file extension.
  return React.createElement(TradesContext.Provider, { value: value }, children);
};

// Create the custom hook to use the context
export const useTrades = (): TradesContextType => {
  const context = useContext(TradesContext);
  if (context === undefined) {
    throw new Error('useTrades must be used within a TradesProvider');
  }
  return context;
};