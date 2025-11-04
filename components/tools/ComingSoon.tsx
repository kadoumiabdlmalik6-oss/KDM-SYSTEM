import React from 'react';
import Card from '../common/Card';

const ComingSoon: React.FC<{title: string}> = ({ title }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <Card className="text-center p-12 flex flex-col items-center justify-center min-h-[250px]">
            <p className="text-2xl font-bold text-primary">Coming Soon!</p>
            <p className="text-gray-400 mt-2">This tool is under active development.</p>
        </Card>
    </div>
);

export default ComingSoon;
