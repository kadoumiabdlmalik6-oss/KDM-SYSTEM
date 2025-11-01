import React, { useState } from 'react';
import { Account } from '../../types';
import { useAccounts } from '../../hooks/useAccounts';
import { useTrades } from '../../hooks/useTrades';
import Card from '../common/Card';

interface AccountsPageProps {
  onAccountSelect: (account: Account) => void;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


const AccountsPage: React.FC<AccountsPageProps> = ({ onAccountSelect }) => {
  const { accounts, addAccount, deleteAccount, loading } = useAccounts();
  const { deleteTradesByAccountId } = useTrades();
  const [newAccountName, setNewAccountName] = useState('');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountName.trim() === '') return;
    addAccount({ name: newAccountName.trim() });
    setNewAccountName('');
  };

  const handleDeleteAccount = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation(); // Prevent card click which navigates to stats
    if (window.confirm('Are you sure you want to delete this account and ALL its associated trades? This action cannot be undone.')) {
        // Orchestrate deletion: first trades, then the account.
        deleteTradesByAccountId(accountId);
        deleteAccount(accountId);
    }
  };

  const visibleAccounts = accounts.filter(account => account.id !== 'default');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Trading Accounts</h2>

      <Card>
        <form onSubmit={handleAddAccount} className="flex gap-2 items-center">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="New account name..."
            className="flex-grow p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="bg-primary text-white p-3 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0" aria-label="Add new account">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
              </svg>
          </button>
        </form>
      </Card>
      
      {loading && <p>Loading accounts...</p>}

      <div className="space-y-4">
        {visibleAccounts.map(account => (
          <Card key={account.id} onClick={() => onAccountSelect(account)} className="hover:bg-primary/10">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{account.name}</h3>
                <button
                    onClick={(e) => handleDeleteAccount(e, account.id)}
                    className="p-2 rounded-full text-red-500/70 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                    aria-label={`Delete account ${account.name}`}
                >
                    <TrashIcon />
                </button>
            </div>
          </Card>
        ))}
      </div>
      
      {visibleAccounts.length === 0 && !loading && (
          <p className="text-center text-gray-400">No accounts found. Add one to get started.</p>
      )}
    </div>
  );
};

export default AccountsPage;