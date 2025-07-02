import React from 'react';
import { Thief, ThiefStatus } from '../types';

interface ThiefRosterProps {
    thieves: Thief[];
    onSelectThief: (id: string) => void;
    day: number;
}

const getStatusInfo = (thief: Thief, day: number): { text: string; color: string; disabled: boolean } => {
    if (thief.status === ThiefStatus.Arrested) return { text: 'Arrested', color: 'text-yellow-400', disabled: true };
    if (thief.status === ThiefStatus.Executed) return { text: 'Executed', color: 'text-red-500', disabled: true };
    if (thief.recruitedOnDay === day) return { text: 'Waiting (New)', color: 'text-cyan-400', disabled: true };
    if (thief.action !== undefined) return { text: 'On Mission', color: 'text-green-400', disabled: true };
    return { text: 'Awaiting Report', color: 'text-gray-300 animate-pulse', disabled: false };
};


const ThiefRoster: React.FC<ThiefRosterProps> = ({ thieves, onSelectThief, day }) => {
    return (
        <div className="w-full h-full p-2 space-y-1 overflow-y-auto">
            <h3 className="font-display text-xl text-red-500 mb-2 px-2">Member Roster</h3>
            {thieves.map(thief => {
                const statusInfo = getStatusInfo(thief, day);

                return (
                    <button
                        key={thief.id}
                        onClick={() => onSelectThief(thief.id)}
                        disabled={statusInfo.disabled}
                        className={`w-full flex items-center space-x-3 p-3 rounded-md transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-red-500`}
                    >
                        <img 
                            src={thief.portraitUrl} 
                            alt={thief.name} 
                            className={`w-12 h-12 rounded-full object-cover border-2 border-gray-600 flex-shrink-0 ${statusInfo.disabled ? 'grayscale' : ''}`} 
                        />
                        <div className="flex-grow overflow-hidden">
                            <p className="font-bold text-white truncate">{thief.name}</p>
                            <p className={`text-xs font-semibold ${statusInfo.color}`}>{statusInfo.text}</p>
                        </div>
                    </button>
                )
            })}
        </div>
    )
};

export default ThiefRoster;