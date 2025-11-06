import React from 'react';
import { Card } from './ui/Card.tsx';

export const ManagePostsTab: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
        <Card>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Coming Soon!</h2>
                <p className="mt-2 text-gray-400">
                    A dashboard to manage your AI-generated posts is currently under development.
                </p>
            </div>
        </Card>
    </div>
  );
};