export interface Account {
  id: string;
  name: string;
}

export interface Trade {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  session: string;
  pnl: number; // Direct Profit/Loss
  rr: number;
  date: string; // ISO string format
  notes: string;
  rating: number; // 1-5
  accountId: string;
  entryPrice?: number;
  exitPrice?: number;
  beforeImageUrl?: string;
  afterImageUrl?: string;
}

export enum Page {
  Home = 'HOME',
  Trades = 'TRADES',
  Add = 'ADD',
  Stats = 'STATS',
  Accounts = 'ACCOUNTS',
}

export type Theme = 'light' | 'dark';