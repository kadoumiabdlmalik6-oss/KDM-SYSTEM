import React, { useContext } from 'react';
import { ThemeContext } from '../App';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);


const Header: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="bg-light-card dark:bg-dark-card shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      <div />
      <h1 className="text-2xl font-bold text-primary text-center">KDM JOURNAL</h1>
      <button onClick={toggleTheme} className="text-light-text dark:text-dark-text p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
        {theme === 'light' ? <MoonIcon/> : <SunIcon/>}
      </button>
    </header>
  );
};

export default Header;