import { Account } from '../types';

const ACCOUNTS_KEY = 'kdm_journal_accounts';

const seedInitialData = () => {
    if(!localStorage.getItem(ACCOUNTS_KEY)) {
        const initialAccounts: Account[] = [
            { id: 'default', name: 'Default Account', balance: 10000 },
        ];
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(initialAccounts));
    }
};

seedInitialData();

export const getAccounts = (): Account[] => {
  const accountsJson = localStorage.getItem(ACCOUNTS_KEY);
  return accountsJson ? JSON.parse(accountsJson) : [];
};

export const addAccount = (account: Omit<Account, 'id'>): void => {
  const accounts = getAccounts();
  const newAccount: Account = { ...account, id: new Date().toISOString() };
  const updatedAccounts = [...accounts, newAccount];
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
};

export const deleteAccount = (id: string): void => {
  const accounts = getAccounts();
  const updatedAccounts = accounts.filter(account => account.id !== id);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
  // Note: Associated trades are now deleted via orchestration in the component
  // to better separate concerns. See AccountsPage.tsx.
};