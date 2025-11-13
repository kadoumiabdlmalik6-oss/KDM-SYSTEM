import { Trade } from '../types';
import * as db from './dbService';

const TRADES_STORE = 'trades';

export const getTrades = async (): Promise<Trade[]> => {
  await db.initDB();
  return db.getAll<Trade>(TRADES_STORE);
};

export const getTradeById = async (id: string): Promise<Trade | undefined> => {
  await db.initDB();
  return db.getById<Trade>(TRADES_STORE, id);
};

export const addTrade = async (trade: Omit<Trade, 'id'>): Promise<Trade> => {
  await db.initDB();
  // Add a random component to the ID to prevent collisions from rapid additions
  const newTrade: Trade = { ...trade, id: new Date().toISOString() + Math.random().toString(36).substr(2, 9) };
  return db.add<Trade>(TRADES_STORE, newTrade);
};

export const updateTrade = async (updatedTrade: Trade): Promise<Trade> => {
  await db.initDB();
  return db.update<Trade>(TRADES_STORE, updatedTrade);
};

export const deleteTrade = async (id: string): Promise<void> => {
  await db.initDB();
  return db.remove(TRADES_STORE, id);
};

export const deleteTradesByAccountId = async (accountId: string): Promise<void> => {
  await db.initDB();
  return db.deleteTradesByAccountIdDB(accountId);
};
