import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { Account } from '../types';
import * as accountService from '../services/accountService';

interface AccountsContextType {
  accounts: Account[];
  loading: boolean;
  addAccount: (account: Omit<Account, 'id'>) => void;
  deleteAccount: (id: string) => void;
  refreshAccounts: () => void;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAccounts = useCallback(() => {
    setLoading(true);
    const fetchedAccounts = accountService.getAccounts();
    setAccounts(fetchedAccounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    accountService.addAccount(account);
    refreshAccounts();
  }, [refreshAccounts]);

  const deleteAccount = useCallback((id: string) => {
    accountService.deleteAccount(id);
    setAccounts(prevAccounts => prevAccounts.filter(account => account.id !== id));
  }, []);

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