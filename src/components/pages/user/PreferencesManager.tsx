import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { UserPreferences } from '../../../types/user';
import { PreferencesManagerProps } from '../../../types/preferences';
import { ApiService } from '../../../services';

const INVESTMENT_OPTIONS = [
  '股票',
  '債券',
  '基金',
  '外匯',
  '期貨',
  '不動產',
  '加密貨幣',
  '黃金',
  'ETF',
];

const RISK_TOLERANCE_OPTIONS = [
  { value: 'low', label: '低風險' },
  { value: 'medium', label: '中等風險' },
  { value: 'high', label: '高風險' },
];

const INVESTMENT_PERIOD_OPTIONS = [
  { value: 'short', label: '短期（1年以內）' },
  { value: 'medium', label: '中期（1-5年）' },
  { value: 'long', label: '長期（5年以上）' },
];

const PreferencesManager: React.FC<PreferencesManagerProps> = ({ userId, onUpdate }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getUserPreferences(userId);
      const newPreferences: UserPreferences = {
        id: response.id || '',
        userId: response.userId || '',
        investmentPreferences: response.investmentPreferences || [],
        riskTolerance: response.riskTolerance || 'low',
        investmentPeriod: response.investmentPeriod || 'short',
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      };
      setPreferences(newPreferences);
    } catch (err) {
      setError('載入偏好設定失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestmentPreferencesChange = (
    event: SelectChangeEvent<string[]>
  ) => {
    const {
      target: { value },
    } = event;

    if (preferences) {
      setPreferences({
        ...preferences,
        investmentPreferences: typeof value === 'string' ? value.split(',') : value,
      });
    }
  };

  const handleRiskToleranceChange = (
    event: SelectChangeEvent
  ) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        riskTolerance: event.target.value as UserPreferences['riskTolerance'],
      });
    }
  };

  const handleInvestmentPeriodChange = (
    event: SelectChangeEvent
  ) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        investmentPeriod: event.target.value as UserPreferences['investmentPeriod'],
      });
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setLoading(true);
    try {
      const updatedPreferences: UserPreferences = {
        ...preferences,
        updatedAt: new Date().toISOString()
      };
      await ApiService.updateUserPreferences(userId, updatedPreferences);
      setPreferences(updatedPreferences);
      onUpdate?.();
      setError(null);
    } catch (error) {
      console.error('儲存偏好設定失敗:', error);
      setError('儲存偏好設定失敗');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        投資偏好設定
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>投資標的</InputLabel>
        <Select
          multiple
          value={preferences.investmentPreferences}
          onChange={handleInvestmentPreferencesChange}
          input={<OutlinedInput label="投資標的" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {INVESTMENT_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>風險承受度</InputLabel>
        <Select
          value={preferences.riskTolerance}
          onChange={handleRiskToleranceChange}
          label="風險承受度"
        >
          {RISK_TOLERANCE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>投資期限</InputLabel>
        <Select
          value={preferences.investmentPeriod}
          onChange={handleInvestmentPeriodChange}
          label="投資期限"
        >
          {INVESTMENT_PERIOD_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default PreferencesManager; 