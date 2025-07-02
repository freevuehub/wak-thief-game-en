import React from 'react';
import { NewsItem } from '../types';

interface EndOfDayReportProps {
  onClose: () => void;
  day: number;
  isSettlement: boolean;
  news?: NewsItem[];
  reportData?: {
    report: string;
    income: number;
    expenses: number;
  };
}

const EndOfDayReport: React.FC<EndOfDayReportProps> = ({ news, onClose, day, isSettlement, reportData }) => {
  const getNewsColor = (type: NewsItem['type']) => {
    switch(type) {
      case 'success': return 'text-green-400';
      case 'failure': return 'text-yellow-400';
      case 'arrest': return 'text-red-500';
      case 'system': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  }

  const title = isSettlement ? `Settlement Report: Day ${day}` : 'News Archives';
  const buttonText = isSettlement ? 'Start Next Day' : 'Close';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-red-500 p-6 rounded-lg shadow-2xl w-full max-w-3xl text-white flex flex-col" style={{ height: '80vh' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-display">{title}</h2>
          <button onClick={onClose} className="text-2xl font-bold text-gray-400 hover:text-white">&times;</button>
        </div>

        {isSettlement && reportData && (
            <div className="mb-4 p-4 bg-gray-800 rounded-md border border-gray-700 grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-400 uppercase">Total Income</p>
                    <p className="text-2xl font-bold text-green-400">+${reportData.income.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400 uppercase">Total Expenses</p>
                    <p className="text-2xl font-bold text-yellow-400">-${reportData.expenses.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400 uppercase">Net Profit</p>
                    <p className={`text-2xl font-bold ${reportData.income - reportData.expenses >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                       ${(reportData.income - reportData.expenses).toLocaleString()}
                    </p>
                </div>
            </div>
        )}

        <div className="flex-grow bg-gray-800/50 p-6 rounded-md overflow-y-auto border border-gray-700 min-h-[150px] flex items-center justify-center">
          {isSettlement && reportData ? (
             <p className="font-display text-xl leading-relaxed whitespace-pre-wrap text-center">{reportData.report}</p>
          ) : (
            <ul className="space-y-3 w-full">
                {news?.map((item, index) => (
                <li key={index} className={`p-3 rounded-md border-l-4 ${getNewsColor(item.type)} border-current bg-gray-900/50`}>
                    <span className="font-bold mr-2">[ Day {item.day} ]</span>{item.message}
                </li>
                ))}
            </ul>
          )}
        </div>
        <button 
            onClick={onClose} 
            className="mt-4 w-full px-6 py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-500 transition-colors"
        >
            {buttonText}
        </button>
      </div>
    </div>
  );
};

export default EndOfDayReport;