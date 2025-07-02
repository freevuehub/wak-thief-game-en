import React, { useState, useEffect } from 'react';
import { Thief, ThiefAction } from '../types';
import { ACTION_DETAILS, RECRUITMENT_COST } from '../constants';
import { generateActionResponse } from '../services/geminiService';
import { useTypewriter } from '../hooks/useTypewriter';

interface ConversationViewProps {
  thief: Thief;
  onClose: () => void;
  onActionConfirmed: (thiefId: string, action: ThiefAction, sectorId?: number) => void;
}

type ConversationPhase = 'opening' | 'dialogue' | 'action' | 'response' | 'closing';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
);

const ConversationView: React.FC<ConversationViewProps> = ({ thief, onClose, onActionConfirmed }) => {
  const [phase, setPhase] = useState<ConversationPhase>('opening');
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<ThiefAction | null>(null);
  const [actionResponse, setActionResponse] = useState<{ responseDialogue: string; closingNarration: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const textToAnimate = (() => {
    switch (phase) {
      case 'opening':
        return thief.openingNarration || `${thief.name} stood before you.`;
      case 'dialogue':
        return thief.dialogue[dialogueIndex] || '';
      case 'response':
        return actionResponse?.responseDialogue || '';
      case 'closing':
        return actionResponse?.closingNarration || '';
      default:
        return '';
    }
  })();
  
  const [animatedText, isTyping] = useTypewriter(textToAnimate, 30);

  const handleNext = async () => {
    if (isTyping) return; // Prevent skipping while typing

    switch (phase) {
      case 'opening':
        setPhase('dialogue');
        break;
      case 'dialogue':
        if (dialogueIndex < thief.dialogue.length - 1) {
          setDialogueIndex(prev => prev + 1);
        } else {
          setPhase('action');
        }
        break;
      case 'response':
        setPhase('closing');
        break;
      case 'closing':
        if (selectedAction !== null) {
            onActionConfirmed(thief.id, selectedAction);
        }
        break;
    }
  };

  const handleSelectAction = async (action: ThiefAction) => {
    setSelectedAction(action);
    setIsLoading(true);
    const response = await generateActionResponse(thief, action);
    setActionResponse(response);
    setIsLoading(false);
    setPhase('response');
  };

  const renderContent = () => {
    if (phase === 'action') {
      return (
        <div className="w-full">
            <p className="text-center text-gray-400 mb-6 font-display text-xl">"Awaiting your orders, Boss."</p>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(ThiefAction).filter(v => !isNaN(Number(v)))).map((actionKey) => {
                  const action = Number(actionKey) as ThiefAction;
                  const details = ACTION_DETAILS[action];
                  return (
                    <button
                        key={action}
                        onClick={() => handleSelectAction(action)}
                        className="p-4 bg-gray-800 hover:bg-red-800 hover:border-red-600 border-2 border-gray-700 rounded-lg text-left transition-all duration-200 group flex flex-col h-full"
                    >
                        <h4 className="font-bold text-xl mb-1 text-red-400 group-hover:text-white">{details.name}</h4>
                        <p className="text-sm text-gray-400 group-hover:text-gray-200 flex-grow">{details.description}</p>
                    </button>
                  )
              })}
            </div>
        </div>
      );
    }
    
    const isNarration = phase === 'opening' || phase === 'closing';

    return (
        <div className="text-center">
            <p className={`text-2xl min-h-[6rem] ${isNarration ? 'text-gray-400 italic' : 'text-white'}`}>
                {animatedText}
            </p>
        </div>
    )
  };

  const showNextButton = phase !== 'action' && !isLoading;
  const buttonText = phase === 'closing' ? 'End Briefing' : 'Continue...';

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border-2 border-red-500 p-8 rounded-lg shadow-2xl w-full max-w-4xl text-white relative flex flex-col" style={{minHeight: '60vh'}}>
          <button onClick={onClose} className="absolute top-3 right-4 text-2xl font-bold text-gray-500 hover:text-white">&times;</button>
          
          <div className="flex items-start space-x-8 mb-8">
            <div className="flex-shrink-0 text-center">
                <img src={thief.portraitUrl} alt={thief.name} className="w-48 h-48 object-cover rounded-lg border-4 border-gray-600" />
                <h2 className="mt-4 text-3xl font-display">{thief.name}</h2>
                <p className="text-gray-400">{thief.personality} / {thief.background}</p>
            </div>
            <div className="w-full mt-4">
                <div className="flex justify-around p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-center">
                        <span className="text-sm text-gray-400">Condition</span>
                        <p className="text-2xl font-bold">{thief.condition}%</p>
                    </div>
                    <div className="text-center">
                        <span className="text-sm text-gray-400">Loyalty</span>
                        <p className="text-2xl font-bold">{thief.loyalty}%</p>
                    </div>
                    <div className="text-center">
                        <span className="text-sm text-gray-400">Success Rate</span>
                        <p className="text-2xl font-bold">{thief.heistSuccessRate}%</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex-grow flex items-center justify-center p-6 bg-black/20 rounded-lg">
            {isLoading ? <LoadingSpinner /> : renderContent()}
          </div>
          
          {showNextButton && (
            <button 
                onClick={handleNext} 
                disabled={isTyping}
                className="mt-6 w-full py-3 bg-red-600 hover:bg-red-500 rounded-md text-white font-bold transition-colors disabled:bg-gray-500 disabled:cursor-wait"
            >
                {buttonText}
            </button>
          )}
      </div>
    </div>
  );
};

export default ConversationView;