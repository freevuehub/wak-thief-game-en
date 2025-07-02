import React from 'react';
import { CalendarIcon, MapIcon, NewsIcon } from './icons';

interface FooterProps {
  day: number;
  onEndDay: () => void;
  onToggleMap: () => void;
  onToggleNews: () => void;
  isEndDayDisabled: boolean;
}

const Footer: React.FC<FooterProps> = ({ day, onEndDay, onToggleMap, onToggleNews, isEndDayDisabled }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-3 z-20 border-t border-gray-700">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button onClick={onToggleNews} className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                        <NewsIcon className="w-5 h-5" />
                        <span>News Archives</span>
                    </button>
                    <button onClick={onToggleMap} className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                        <MapIcon className="w-5 h-5" />
                        <span>City Map</span>
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-6 h-6 text-gray-400" />
                        <span className="text-xl font-bold">Day {day}</span>
                    </div>
                    <button 
                        onClick={onEndDay}
                        disabled={isEndDayDisabled}
                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                        End Day
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;