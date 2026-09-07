export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Situation {
  id: string;
  user_id: string;
  aggressor_id: string | null;
  aggression_type: string;
  severity: number;
  description: string | null;
  created_at: string;
}

export interface Aggressor {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export type AggressionType =
  | 'verbal'
  | 'physical'
  | 'psychological'
  | 'economic'
  | 'digital'
  | 'sexual'
  | 'property'
  | 'other';

export interface AggressionTypeOption {
  value: AggressionType;
  label: string;
  emoji: string;
  color: string;
}

export const AGGRESSION_TYPES: AggressionTypeOption[] = [
  { value: 'verbal', label: 'Verbal', emoji: '💬', color: '#8b5cf6' },
  { value: 'physical', label: 'Física', emoji: '👊', color: '#ef4444' },
  { value: 'psychological', label: 'Psicológica', emoji: '🧠', color: '#f59e0b' },
  { value: 'economic', label: 'Económica', emoji: '💰', color: '#22c55e' },
  { value: 'digital', label: 'Digital', emoji: '📱', color: '#3b82f6' },
  { value: 'sexual', label: 'Sexual', emoji: '🚫', color: '#ec4899' },
  { value: 'property', label: 'Patrimonial', emoji: '🏠', color: '#78716c' },
  { value: 'other', label: 'Otra', emoji: '❓', color: '#94a3b8' },
];
