export interface UserPreferences {
  id: string;
  userId: string;
  preferences: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  investmentPeriod: 'short' | 'medium' | 'long';
  investmentPreferences: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PreferencesManagerProps {
  userId: string;
  onUpdate?: () => void;
} 