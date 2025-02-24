export interface UserPreferences {
  userId: string;
  investmentPreferences: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  investmentPeriod: 'short' | 'medium' | 'long';
  updatedAt: Date;
}

export interface PreferencesManagerProps {
  userId: string;
  onUpdate?: () => void;
} 