export interface UserPreferences {
  id: string;
  userId: string;
  investmentPreferences: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  investmentPeriod: 'short' | 'medium' | 'long';
  createdAt: Date;
  updatedAt: Date;
}

export interface PreferencesManagerProps {
  userId: string;
  onUpdate?: () => void;
} 