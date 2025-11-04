import React from 'react';
import Card from './Card';

interface ToolCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, onClick }) => {
    return (
        <Card
            onClick={onClick}
            className="flex flex-col items-center text-center p-6 space-y-3 transform hover:scale-105 hover:shadow-primary/20 transition-transform duration-200"
        >
            <div className="text-primary">{icon}</div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </Card>
    );
};

export default ToolCard;