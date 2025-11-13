import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { Account } from '../types';
import * as accountService from '../services/accountService';

interface AccountsContextType {
  accounts: Account[];
  loading: boolean;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAccounts = useCallback(async () => {
    setLoading(true);
    try {
        const fetchedAccounts = await accountService.getAccounts();
        setAccounts(fetchedAccounts);
    } catch (error) {
        console.error("Failed to fetch accounts:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const addAccount = useCallback(async (account: Omit<Account, 'id'>) => {
    await accountService.addAccount(account);
    await refreshAccounts();
  }, [refreshAccounts]);

  const deleteAccount = useCallback(async (id: string) => {
    await accountService.deleteAccount(id);
    await refreshAccounts();
  }, [refreshAccounts]);

  const value = useMemo(() => ({
    accounts,
    loading,
    addAccount,
    deleteAccount,
    refreshAccounts
  }), [accounts, loading, addAccount, deleteAccount, refreshAccounts]);

  return React.createElement(AccountsContext.Provider, { value }, children);
};

export const useAccounts = (): AccountsContextType => {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};
