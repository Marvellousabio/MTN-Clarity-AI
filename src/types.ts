export type Language = 'EN' | 'PIDGIN' | 'HA' | 'YO' | 'IG';

export interface Plan {
  id: string;
  name: string;
  monthlyCost: number;
  dataVolume: string;
  nightBrowsing: string;
  callBonus: string;
  validity: string;
  rollover: boolean;
  matchScore: number;
}

export interface UsageData {
  category: string;
  percentage: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface UserProfile {
  name: string;
  currentPlanId: string;
  monthlySpend: number;
  dataBurnRate: 'Low' | 'Medium' | 'High';
  heavySocialUsage: boolean;
}
