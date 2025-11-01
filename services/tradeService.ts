import { Trade } from '../types';

const TRADES_KEY = 'kdm_journal_trades';

// Seed with some initial data if none exists
const seedInitialData = () => {
    if(!localStorage.getItem(TRADES_KEY)) {
        const initialTrades: Trade[] = [
            { id: '1', pair: 'BTCUSD', type: 'buy', session: 'New York', pnl: 1500, rr: 2.5, date: '2024-07-15T10:00:00Z', notes: 'Good entry based on RSI divergence.', rating: 4, accountId: 'default', entryPrice: 65000, exitPrice: 66500 },
            { id: '2', pair: 'EURUSD', type: 'sell', session: 'London', pnl: -50, rr: 1.5, date: '2024-07-14T14:30:00Z', notes: 'Stopped out, misread the trend.', rating: 2, accountId: 'default', entryPrice: 1.0750, exitPrice: 1.0755 },
            { id: '3', pair: 'XAUUSD', type: 'buy', session: 'Asia', pnl: 2500, rr: 3, date: '2024-07-13T09:00:00Z', notes: 'Caught the breakout perfectly.', rating: 5, accountId: 'default', entryPrice: 2300, exitPrice: 2325 },
        ];
        localStorage.setItem(TRADES_KEY, JSON.stringify(initialTrades));
    }
};

seedInitialData();

export const getTrades = (): Trade[] => {
  const tradesJson = localStorage.getItem(TRADES_KEY);
  return tradesJson ? JSON.parse(tradesJson) : [];
};

export const getTradeById = (id: string): Trade | undefined => {
  const trades = getTrades();
  return trades.find(trade => trade.id === id);
};

export const addTrade = (trade: Omit<Trade, 'id'>): void => {
  const trades = getTrades();
  const newTrade: Trade = { ...trade, id: new Date().toISOString() };
  const updatedTrades = [...trades, newTrade];
  localStorage.setItem(TRADES_KEY, JSON.stringify(updatedTrades));
};

export const updateTrade = (updatedTrade: Trade): void => {
  const trades = getTrades();
  const index = trades.findIndex(trade => trade.id === updatedTrade.id);
  if (index !== -1) {
    trades[index] = updatedTrade;
    localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
  }
};

export const deleteTrade = (id: string): void => {
  const trades = getTrades();
  const updatedTrades = trades.filter(trade => trade.id !== id);
  localStorage.setItem(TRADES_KEY, JSON.stringify(updatedTrades));
};

export const deleteTradesByAccountId = (accountId: string): void => {
  const trades = getTrades();
  const updatedTrades = trades.filter(trade => trade.accountId !== accountId);
  localStorage.setItem(TRADES_KEY, JSON.stringify(updatedTrades));
};
