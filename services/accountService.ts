import { Account } from '../types';
import * as db from './dbService';

const ACCOUNTS_STORE = 'accounts';

export const getAccounts = async (): Promise<Account[]> => {
  await db.initDB();
  return db.getAll<Account>(ACCOUNTS_STORE);
};

export const addAccount = async (account: Omit<Account, 'id'>): Promise<Account> => {
  await db.initDB();
  const newAccount: Account = { ...account, id: new Date().toISOString() + Math.random().toString(36).substr(2, 9) };
  return db.add<Account>(ACCOUNTS_STORE, newAccount);
};

export const deleteAccount = async (id: string): Promise<void> => {
  await db.initDB();
  return db.remove(ACCOUNTS_STORE, id);
};
