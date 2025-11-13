import { Trade, Account } from '../types';

const DB_NAME = 'KDMJournalDB';
const DB_VERSION = 1;
const TRADES_STORE = 'trades';
const ACCOUNTS_STORE = 'accounts';

let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(TRADES_STORE)) {
        const tradesStore = dbInstance.createObjectStore(TRADES_STORE, { keyPath: 'id' });
        tradesStore.createIndex('accountId', 'accountId', { unique: false });
        tradesStore.createIndex('date', 'date', { unique: false });
      }
      if (!dbInstance.objectStoreNames.contains(ACCOUNTS_STORE)) {
        dbInstance.createObjectStore(ACCOUNTS_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const add = <T>(storeName: string, item: T): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => {
        console.error(`Error adding to ${storeName}:`, request.error);
        reject(request.error)
    };
  });
};

export const getAll = <T>(storeName: string): Promise<T[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            console.error(`Error getting all from ${storeName}:`, request.error);
            reject(request.error);
        }
    });
};

export const getById = <T>(storeName: string, id: string): Promise<T | undefined> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            console.error(`Error getting by id from ${storeName}:`, request.error);
            reject(request.error);
        }
    });
};

export const update = <T>(storeName: string, item: T): Promise<T> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        request.onsuccess = () => resolve(item);
        request.onerror = () => {
             console.error(`Error updating in ${storeName}:`, request.error);
            reject(request.error);
        }
    });
};

export const remove = (storeName: string, id: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error(`Error removing from ${storeName}:`, request.error);
            reject(request.error);
        }
    });
};

export const deleteTradesByAccountIdDB = (accountId: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(TRADES_STORE, 'readwrite');
        const store = transaction.objectStore(TRADES_STORE);
        const index = store.index('accountId');
        const request = index.openCursor(IDBKeyRange.only(accountId));

        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            } else {
                resolve();
            }
        };
        request.onerror = () => {
            console.error(`Error deleting trades by accountId:`, request.error);
            reject(request.error);
        }
    });
};
