import React, { useState, useEffect, createContext } from 'react';
import { Page, Theme, Account } from './types';
import HomePage from './components/pages/HomePage';
import TradesListPage from './components/pages/TradesListPage';
import AddTradePage from './components/pages/AddTradePage';
import StatsPage from './components/StatsPage';
import AccountsPage from './components/pages/AccountsPage';
import AccountStatsPage from './components/pages/AccountStatsPage';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import { TradesProvider } from './hooks/useTrades';
import { AccountsProvider } from './hooks/useAccounts';
import PINScreen from './components/PINScreen';

export const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'light',
  toggleTheme: () => {},
});

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state for PIN auth
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as Theme;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleSetCurrentPage = (page: Page) => {
    setSelectedAccount(null); // Reset selected account when changing main pages
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <HomePage navigate={handleSetCurrentPage} />;
      case Page.Trades:
        return <TradesListPage navigate={handleSetCurrentPage} />;
      case Page.Add:
        return <AddTradePage navigate={handleSetCurrentPage} />;
      case Page.Stats:
        return <StatsPage />;
      case Page.Accounts:
        if (selectedAccount) {
          return <AccountStatsPage account={selectedAccount} onBack={() => setSelectedAccount(null)} />;
        }
        return <AccountsPage onAccountSelect={setSelectedAccount} />;
      default:
        return <HomePage navigate={handleSetCurrentPage} />;
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

  // If not authenticated, show PIN screen
  if (!isAuthenticated) {
    return <PINScreen onPinSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AccountsProvider>
        <TradesProvider>
          <div className="bg-light-bg dark:bg-dark-bg min-h-screen text-light-text dark:text-dark-text transition-colors duration-300">
            <div className="max-w-md mx-auto flex flex-col h-screen">
              <Header />
              <main className="flex-grow overflow-y-auto p-4 pb-24">
                {renderPage()}
              </main>
              <BottomNav currentPage={currentPage} setCurrentPage={handleSetCurrentPage} />
            </div>
          </div>
        </TradesProvider>
      </AccountsProvider>
    </ThemeContext.Provider>
  );
}