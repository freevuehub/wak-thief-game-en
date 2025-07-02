import React, { useState } from 'react';
import { generateThiefProfile, generateThiefPortrait } from '../services/geminiService';
import { Thief } from '../types';
import { RECRUITMENT_COST } from '../constants';

interface ThiefCreationProps {
  onThiefCreated: (thief: Omit<Thief, 'id' | 'recruitedOnDay'> | null) => void;
  isFirstThief: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
);

const CreationWrapper: React.FC<{ children: React.ReactNode; isFirstThief: boolean; onClose: () => void }> = ({ children, isFirstThief, onClose }) => {
    if (isFirstThief) {
        return <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-gray-900 z-50">
            <div className="bg-gray-800 border-2 border-red-500 p-8 rounded-lg shadow-2xl w-full max-w-md text-white">
                <h2 className="text-3xl font-display text-center mb-2">Create First Member</h2>
                <p className="text-center text-gray-400 mb-6">Every syndicate needs a beginning.</p>
                {children}
            </div>
        </div>
    }
    return <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 backdrop-blur-sm">
        <div className="bg-gray-800 border-2 border-red-500 p-8 rounded-lg shadow-2xl w-full max-w-md text-white relative">
            <button onClick={onClose} className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-white">&times;</button>
            <h2 className="text-3xl font-display text-center mb-2">Recruit New Member <span className="text-lg text-yellow-400">(Cost: ${RECRUITMENT_COST.toLocaleString()})</span></h2>
            {children}
        </div>
    </div>
}


const ThiefCreation: React.FC<ThiefCreationProps> = ({ onThiefCreated, isFirstThief }) => {
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [background, setBackground] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedThief, setGeneratedThief] = useState<Omit<Thief, 'id' | 'recruitedOnDay'> | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedThief(null);
    try {
      const profile = await generateThiefProfile(name, personality, background);
      const portraitUrl = await generateThiefPortrait(profile.name, profile.personality, profile.background);
      
      setGeneratedThief({
        name: profile.name,
        personality: profile.personality,
        background: profile.background,
        portraitUrl,
        dialogue: profile.dialogue,
        loyalty: 50,
        heistSuccessRate: 50,
        condition: 100,
        status: 0, // Recruited
      });

    } catch (error) {
      console.error("Failed to generate thief:", error);
      alert("An error occurred while creating the member. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (generatedThief) {
      onThiefCreated(generatedThief);
      setGeneratedThief(null);
      setName('');
      setPersonality('');
      setBackground('');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <LoadingSpinner />
          <p className="mt-4 text-gray-300">Generating member profile...</p>
        </div>
      );
    }

    if (generatedThief) {
      return (
        <div className="flex flex-col items-center">
            <img src={generatedThief.portraitUrl} alt="Generated Thief" className="w-48 h-48 object-cover rounded-lg border-4 border-gray-600 mb-4" />
            <h3 className="text-2xl font-display">{generatedThief.name}</h3>
            <p className="text-gray-400">{generatedThief.personality} / {generatedThief.background}</p>
            <p className="italic text-center my-4 p-2 bg-black/20 rounded-md">"{generatedThief.dialogue.join(' ')}"</p>
            <div className="flex space-x-4 mt-4">
                <button onClick={handleGenerate} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">Regenerate</button>
                <button onClick={handleConfirm} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-md transition-colors font-bold">Confirm Recruitment</button>
            </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-center text-gray-400">Enter the new member's details. Leave fields blank for random generation.</p>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name (e.g., 'Silas')" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        <input type="text" value={personality} onChange={e => setPersonality(e.target.value)} placeholder="Personality Tag (e.g., 'Bold')" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        <input type="text" value={background} onChange={e => setBackground(e.target.value)} placeholder="Background Tag (e.g., 'Ex-Accountant')" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        <button onClick={handleGenerate} className="w-full mt-4 p-3 bg-red-600 hover:bg-red-500 rounded-md transition-colors font-bold">Generate</button>
      </div>
    );
  };
  
  const handleClose = () => {
      if (!isFirstThief) {
          onThiefCreated(null);
      }
  }

  return (
    <CreationWrapper isFirstThief={isFirstThief} onClose={handleClose}>
        {renderContent()}
    </CreationWrapper>
  );
};

export default ThiefCreation;