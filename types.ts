export enum ThiefStatus {
  Recruited,
  Idle,
  Resting,
  Stealing,
  Scouting,
  Arrested,
  Executed,
  Betrayed,
}

export enum ThiefAction {
  Rest,
  Steal,
  Scout,
  Execute,
}

export interface Thief {
  id: string;
  name: string;
  personality: string;
  background: string;
  portraitUrl: string;
  loyalty: number; // 0-100
  heistSuccessRate: number; // 0-100 (base)
  condition: number; // 0-100 (health/stamina)
  dialogue: string[];
  openingNarration?: string;
  status: ThiefStatus;
  action?: ThiefAction;
  assignedSectorId?: number;
  recruitedOnDay: number;
}

export interface Sector {
  id: number;
  name:string;
  alertLevel: number; // 0-100
  baseLoot: number;
  lastScoutedDay?: number;
  scoutedInfo?: string;
}

export enum GamePhase {
  Recruitment,
  Assignment,
  MapSelection,
  EndOfDay,
  GameOver,
}

export interface NewsItem {
  day: number;
  message: string;
  type: 'success' | 'failure' | 'neutral' | 'arrest' | 'system';
}