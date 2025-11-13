import { initDB, add, getAll } from './dbService';
import { Trade, Account } from '../types';

const DATA_VERSION_KEY = 'kdm_journal_data_version';
const TRADES_KEY = 'kdm_journal_trades';
const ACCOUNTS_KEY = 'kdm_journal_accounts';
const CURRENT_VERSION = 2; // V2 uses IndexedDB

const migrateAndSeed = async () => {
    const oldTradesData = localStorage.getItem(TRADES_KEY);
    const oldAccountsData = localStorage.getItem(ACCOUNTS_KEY);

    if (oldTradesData || oldAccountsData) {
        console.log('Old localStorage data found. Migrating to IndexedDB...');
        if (oldAccountsData) {
            try {
                const accounts: Account[] = JSON.parse(oldAccountsData);
                for (const account of accounts) await add('accounts', account);
            } catch (e) { console.error('Error parsing or migrating accounts', e); }
        }
        if (oldTradesData) {
            try {
                const trades: Trade[] = JSON.parse(oldTradesData);
                for (const trade of trades) await add('trades', trade);
            } catch (e) { console.error('Error parsing or migrating trades', e); }
        }
        // Clean up old data
        localStorage.removeItem(TRADES_KEY);
        localStorage.removeItem(ACCOUNTS_KEY);
        console.log('Migration complete.');
    } else {
        const tradesInDb = await getAll('trades');
        if (tradesInDb.length === 0) {
            console.log('No data found. Seeding initial data...');
            const defaultAccount: Account = { id: 'default', name: 'Default Account', balance: 10000 };
            await add('accounts', defaultAccount);
            
            const initialTrades: Trade[] = [
                { id: '1', pair: 'BTCUSD', type: 'buy', session: 'New York', pnl: 1500, rr: 2.5, date: '2024-07-15T10:00:00Z', notes: 'Good entry based on RSI divergence.', rating: 4, accountId: 'default', entryPrice: 65000, exitPrice: 66500 },
                { id: '2', pair: 'EURUSD', type: 'sell', session: 'London', pnl: -50, rr: 1.5, date: '2024-07-14T14:30:00Z', notes: 'Stopped out, misread the trend.', rating: 2, accountId: 'default', entryPrice: 1.0750, exitPrice: 1.0755 },
                { id: '3', pair: 'XAUUSD', type: 'buy', session: 'Asia', pnl: 2500, rr: 3, date: '2024-07-13T09:00:00Z', notes: 'Caught the breakout perfectly.', rating: 5, accountId: 'default', entryPrice: 2300, exitPrice: 2325 },
            ];

            for(const trade of initialTrades) await add('trades', trade);
        }
    }
};

export const runMigrations = async () => {
  try {
    await initDB();
    const storedVersion = parseInt(localStorage.getItem(DATA_VERSION_KEY) || '0', 10);
    
    if (storedVersion < CURRENT_VERSION) {
      console.log(`Upgrading data from version ${storedVersion} to ${CURRENT_VERSION}`);
      await migrateAndSeed();
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION.toString());
      console.log(`Data upgrade complete.`);
    }
  } catch (error) {
    console.error("Failed to run migrations:", error);
  }
};
