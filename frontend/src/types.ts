export type Language = 'EN' | 'PIDGIN' | 'HA' | 'YO' | 'IG';

export type NotificationType = 'plan_update' | 'savings' | 'reminder' | 'system' | 'message';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  action?: string;
}

export interface Plan {
  id: string;
  name: string;
  category: string;
  monthlyCost: number;
  dataGB: number;
  callMinutes: number;
  smsCount: number;
  validityDays: number;
  activationCode: string;
  summary: string;
  features: string[];
  bestFor: string;
  limitations: string;
  competitors: string[];
  upsellTo: string | null;
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
  planDetails?: Plan;
}
