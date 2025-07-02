import { ThiefAction } from './types';

export const INITIAL_CASH = 5000;
export const RECRUITMENT_COST = 500;
export const SECTOR_COUNT = 16;
export const DAILY_COST_PER_THIEF = 100;
export const INITIAL_LOYALTY = 50;
export const INITIAL_HEIST_SUCCESS_RATE = 50;
export const INITIAL_CONDITION = 100;

export const ACTION_DETAILS: { [key in ThiefAction]: { name: string; description: string } } = {
  [ThiefAction.Rest]: {
    name: 'Rest',
    description: "Recovers the member's condition. Consumes one day.",
  },
  [ThiefAction.Steal]: {
    name: 'Steal',
    description: 'Select a sector on the map to steal money. Carries a risk of being discovered.',
  },
  [ThiefAction.Scout]: {
    name: 'Scout',
    description: 'Gathers intelligence on police activity and potential loot in a specific sector.',
  },
  [ThiefAction.Execute]: {
    name: 'Execute',
    description: "Executes a member. Increases other members' loyalty, but decreases their success rate.",
  },
};

export const ACTION_RESPONSE_DIALOGUES: { [key in ThiefAction]: { responseDialogue: string; closingNarration: string } } = {
    [ThiefAction.Rest]: {
        responseDialogue: 'Understood, Boss. I need some rest.',
        closingNarration: 'He gave a slight bow and left the room, looking exhausted.',
    },
    [ThiefAction.Steal]: {
        responseDialogue: "Leave it to me. I won't disappoint.",
        closingNarration: 'His eyes gleamed with greed. He vanished silently into the shadows.',
    },
    [ThiefAction.Scout]: {
        responseDialogue: "Information is power. I'll be right back.",
        closingNarration: 'He slipped out of the office as silently as a shadow.',
    },
    [ThiefAction.Execute]: {
        responseDialogue: '...If it is your will, Boss.',
        closingNarration: 'He nodded heavily, his face an unreadable mask.',
    },
};