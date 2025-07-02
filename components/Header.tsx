import React from 'react';
import { MoneyIcon, AlertIcon, TeamIcon, LoyaltyIcon } from './icons';

interface HeaderProps {
  cash: number;
  globalAlertLevel: number;
  thiefCount: number;
  averageLoyalty: number;
}

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className={`flex items-center space-x-2 bg-gray-800/50 p-2 rounded-lg border border-gray-700/50 ${colorClass}`}>
        {icon}
        <div className="flex flex-col text-sm">
            <span className="text-gray-400 uppercase text-xs font-bold">{label}</span>
            <span className="font-bold text-base">{value}</span>
        </div>
    </div>
);


const Header: React.FC<HeaderProps> = ({ cash, globalAlertLevel, thiefCount, averageLoyalty }) => {
    return (
        <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-3 z-20 border-b border-gray-700">
            <div className="max-w-7xl mx-auto flex justify-between items-center space-x-4">
                <h1 className="text-2xl font-display text-red-500">Syndicate</h1>
                <div className="flex items-center space-x-4 md:space-x-6">
                    <StatItem icon={<MoneyIcon className="w-6 h-6 text-green-400"/>} label="Funds" value={`$${cash.toLocaleString()}`} colorClass="text-green-300" />
                    <StatItem icon={<AlertIcon className="w-6 h-6 text-yellow-400"/>} label="Alert" value={`${Math.round(globalAlertLevel)}%`} colorClass="text-yellow-300" />
                    <StatItem icon={<TeamIcon className="w-6 h-6 text-blue-400"/>} label="Members" value={thiefCount} colorClass="text-blue-300" />
                    <StatItem icon={<LoyaltyIcon className="w-6 h-6 text-pink-400"/>} label="Loyalty" value={`${Math.round(averageLoyalty)}%`} colorClass="text-pink-300" />
                </div>
            </div>
        </header>
    );
};

export default Header;