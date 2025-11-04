import React, { useState, useMemo } from 'react';
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

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const AccountsPage: React.FC<AccountsPageProps> = ({ onAccountSelect }) => {
  const { accounts, addAccount, loading, deleteAccount } = useAccounts();
  const { trades, deleteTradesByAccountId } = useTrades();
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountName.trim() === '' || !newAccountBalance) {
      alert('Please provide an account name and initial balance.');
      return;
    }
    addAccount({ name: newAccountName.trim(), balance: parseFloat(newAccountBalance) });
    setNewAccountName('');
    setNewAccountBalance('');
  };

  const handleDeleteAccount = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation(); // Prevent card click which navigates to stats
    if (window.confirm('Are you sure you want to delete this account and ALL its associated trades? This action cannot be undone.')) {
        // Orchestrate deletion: first trades, then the account.
        deleteTradesByAccountId(accountId);
        deleteAccount(accountId);
    }
  };

  const handleDownloadAccountCSV = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation(); // Prevent card click
    
    const accountTrades = trades.filter(trade => trade.accountId === accountId);
    const account = accounts.find(acc => acc.id === accountId);

    if (accountTrades.length === 0) {
        alert(`لا توجد صفقات لتنزيلها لحساب '${account?.name}'.`);
        return;
    }

    const headers = ["Date", "Pair", "Type", "Session", "P/L ($)", "R/R", "Rating", "Notes"];
    
    const escapeCSV = (val: any): string => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvRows = accountTrades.map(trade => {
        const rowData = [
            new Date(trade.date).toLocaleString(),
            trade.pair,
            trade.type,
            trade.session,
            trade.pnl.toFixed(2),
            trade.rr,
            trade.rating,
            trade.notes,
        ];
        return rowData.map(escapeCSV).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const filename = `kdm_journal_trades_${account?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || accountId}.csv`;
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };

  const visibleAccounts = accounts.filter(account => account.id !== 'default');
  
  const accountsWithData = useMemo(() => {
    return visibleAccounts.map(account => {
      const accountTrades = trades.filter(trade => trade.accountId === account.id);
      const totalPnl = accountTrades.reduce((acc, trade) => acc + trade.pnl, 0);
      const currentBalance = (account.balance || 0) + totalPnl;
      return {
        ...account,
        totalPnl,
        currentBalance,
      };
    });
  }, [visibleAccounts, trades]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Trading Accounts</h2>

      <Card>
        <form onSubmit={handleAddAccount} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="New account name..."
            className="w-full sm:flex-grow p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="number"
            step="any"
            value={newAccountBalance}
            onChange={(e) => setNewAccountBalance(e.target.value)}
            placeholder="Balance ($)"
            className="w-full sm:w-36 p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button type="submit" className="w-full sm:w-auto bg-primary text-white p-3 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0" aria-label="Add new account">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto sm:mx-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
              </svg>
          </button>
        </form>
      </Card>
      
      {loading && <p>Loading accounts...</p>}

      <div className="space-y-4">
        {accountsWithData.map(account => (
          <Card key={account.id} onClick={() => onAccountSelect(account)} className="hover:bg-primary/10">
             <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{account.name}</h3>
                  <p className={`text-lg font-bold ${account.currentBalance >= (account.balance || 0) ? 'text-green-500' : 'text-red-500'}`}>
                    ${account.currentBalance.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Initial: ${(account.balance || 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                        <p className={`font-semibold ${account.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {account.totalPnl >= 0 ? '+' : ''}${account.totalPnl.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">Total P/L</p>
                  </div>
                   <button
                      onClick={(e) => handleDownloadAccountCSV(e, account.id)}
                      className="p-2 rounded-full text-primary/70 hover:bg-primary/20 hover:text-primary transition-colors"
                      aria-label={`Download trades for ${account.name}`}
                  >
                      <DownloadIcon />
                  </button>
                  <button
                      onClick={(e) => handleDeleteAccount(e, account.id)}
                      className="p-2 rounded-full text-red-500/70 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                      aria-label={`Delete account ${account.name}`}
                  >
                      <TrashIcon />
                  </button>
                </div>
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