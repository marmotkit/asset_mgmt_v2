import { Box, FormControl, InputLabel, MenuItem, Select, Typography, Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { ApiService } from '../../../services/api.service';
import { UserPreference, UserPreferences, InvestmentPreferences } from '../../../types/user';

interface PreferencesManagerProps {
  userId: string;
  onSave?: (preferences: UserPreferences) => void;
}

const defaultPreferences: UserPreferences = {
  id: '',
  userId: '',
  investmentPreferences: {
    riskTolerance: 'moderate',
    investmentPeriod: 'medium',
    preferences: []
  },
  riskTolerance: 'moderate',
  investmentPeriod: 'medium',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const PreferencesManager: React.FC<PreferencesManagerProps> = ({ userId, onSave }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const userPrefs = await ApiService.getUserPreferences(userId);
      if (userPrefs && userPrefs.length > 0) {
        setPreferences({
          ...defaultPreferences,
          ...userPrefs[0]
        });
      } else {
        setPreferences({
          ...defaultPreferences,
          userId
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入偏好設定時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadPreferences();
    }
  }, [userId]);

  const handleRiskToleranceChange = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      riskTolerance: value,
      investmentPreferences: {
        ...prev.investmentPreferences,
        riskTolerance: value
      }
    }));
  };

  const handleInvestmentPeriodChange = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      investmentPeriod: value,
      investmentPreferences: {
        ...prev.investmentPreferences,
        investmentPeriod: value
      }
    }));
  };

  const handlePreferencesChange = (selectedPreferences: string[]) => {
    setPreferences(prev => ({
      ...prev,
      investmentPreferences: {
        ...prev.investmentPreferences,
        preferences: selectedPreferences
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedPreferences = await ApiService.updateUserPreferences(userId, [{
        key: 'investmentPreferences',
        value: JSON.stringify(preferences.investmentPreferences)
      }]);

      if (onSave) {
        onSave(preferences);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存偏好設定時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <FormControl fullWidth margin="normal">
        <InputLabel>風險承受度</InputLabel>
        <Select
          value={preferences.riskTolerance}
          onChange={(e) => handleRiskToleranceChange(e.target.value)}
          label="風險承受度"
        >
          <MenuItem value="low">低風險</MenuItem>
          <MenuItem value="moderate">中等風險</MenuItem>
          <MenuItem value="high">高風險</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>投資期限</InputLabel>
        <Select
          value={preferences.investmentPeriod}
          onChange={(e) => handleInvestmentPeriodChange(e.target.value)}
          label="投資期限"
        >
          <MenuItem value="short">短期（1年以內）</MenuItem>
          <MenuItem value="medium">中期（1-3年）</MenuItem>
          <MenuItem value="long">長期（3年以上）</MenuItem>
        </Select>
      </FormControl>

      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
          fullWidth
        >
          儲存設定
        </Button>
      </Box>
    </Box>
  );
};