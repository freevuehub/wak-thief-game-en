
import React from 'react';

const GameOver: React.FC = () => {
    const restartGame = () => {
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-gray-900 border-2 border-red-700 p-10 rounded-lg shadow-2xl text-center text-white max-w-lg mx-auto">
                <h2 className="text-6xl md:text-7xl font-display text-red-500 mb-4">GAME OVER</h2>
                <p className="text-lg md:text-xl text-gray-300 mb-8">Your criminal empire has crumbled due to bankruptcy.</p>
                <button 
                    onClick={restartGame}
                    className="px-8 py-4 bg-red-600 text-white font-bold rounded-md hover:bg-red-500 transition-all transform hover:scale-105"
                >
                    Restart
                </button>
            </div>
        </div>
    );
};

export default GameOver;