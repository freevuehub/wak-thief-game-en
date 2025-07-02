import React from 'react';
import { Sector } from '../types';

interface MapViewProps {
  sectors: Sector[];
  onSelectSector?: (sectorId: number) => void;
  onClose: () => void;
  isSelectionMode: boolean;
  day: number;
}

const getAlertColor = (level: number): string => {
  if (level > 80) return 'bg-red-800 border-red-500 hover:bg-red-700';
  if (level > 60) return 'bg-red-600 border-red-400 hover:bg-red-500';
  if (level > 40) return 'bg-yellow-700 border-yellow-500 hover:bg-yellow-600';
  if (level > 20) return 'bg-yellow-500 border-yellow-300 hover:bg-yellow-400';
  return 'bg-green-700 border-green-500 hover:bg-green-600';
};

const MapView: React.FC<MapViewProps> = ({ sectors, onSelectSector, onClose, isSelectionMode, day }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-30 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-red-500 p-6 rounded-lg shadow-2xl w-full max-w-4xl text-white relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-2xl font-bold text-gray-400 hover:text-white">&times;</button>
        <h2 className="text-2xl font-display text-center mb-4">{isSelectionMode ? "Select Target Sector" : "City Map"}</h2>
        {isSelectionMode && <p className="text-center text-yellow-400 mb-4">Select a sector to proceed with the operation.</p>}

        <div className="grid grid-cols-4 gap-2">
          {sectors.map((sector) => {
            const wasScoutedRecently = sector.lastScoutedDay && day - sector.lastScoutedDay <= 1;
            return (
              <button
                key={sector.id}
                onClick={() => onSelectSector && onSelectSector(sector.id)}
                disabled={!isSelectionMode}
                className={`p-2 h-32 rounded-md border-2 transition-all flex flex-col justify-between text-left ${getAlertColor(sector.alertLevel)} ${isSelectionMode ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div>
                    <div className="font-bold text-sm">{sector.name}</div>
                    <div className="text-right">
                        <div className="text-xs">Alert</div>
                        <div className="font-bold text-lg">{Math.round(sector.alertLevel)}%</div>
                    </div>
                </div>
                {wasScoutedRecently && sector.scoutedInfo && !isSelectionMode && (
                    <div className="text-xs mt-1 p-1 bg-black/40 rounded">
                        <p className="font-bold text-yellow-300">Intel:</p>
                        <p>{sector.scoutedInfo}</p>
                    </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default MapView;