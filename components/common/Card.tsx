
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-md transition-all duration-300 ${className} ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
    >
      {children}
    </div>
  );
};

export default Card;
