import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary animate-pulse">
          KDM JOURNAL
        </h1>
        <div className="mt-6 flex justify-center space-x-4 text-dark-text text-md tracking-wider animate-fadeIn">
          <span>DISCIPLINE</span>
          <span className="text-primary">&bull;</span>
          <span>FOCUS</span>
          <span className="text-primary">&bull;</span>
          <span>CONTINUITY</span>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
