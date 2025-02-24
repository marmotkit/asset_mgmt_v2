import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { UserPreferences, PreferencesManagerProps } from '../../../types/preferences';
import { ApiService } from '../../../services/api.service';

const INVESTMENT_OPTIONS = [
  '股票',
  '債券',
  '基金',
  '外匯',
  '期貨',
  '不動產'
];

const PreferencesManager: React.FC<PreferencesManagerProps> = ({ userId, onUpdate }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUserPreferences(userId);
      setPreferences(data);
    } catch (err) {
      setError('載入偏好設定失敗');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!preferences) {
    return <Alert severity="info">無偏好設定資料</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        投資偏好設定
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">風險承受度</FormLabel>
        <RadioGroup
          value={preferences.riskTolerance}
          onChange={(e) => {
            setPreferences({
              ...preferences,
              riskTolerance: e.target.value as 'low' | 'medium' | 'high'
            });
          }}
        >
          <FormControlLabel value="low" control={<Radio />} label="保守" />
          <FormControlLabel value="medium" control={<Radio />} label="穩健" />
          <FormControlLabel value="high" control={<Radio />} label="積極" />
        </RadioGroup>
      </FormControl>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">投資期限</FormLabel>
        <RadioGroup
          value={preferences.investmentPeriod}
          onChange={(e) => {
            setPreferences({
              ...preferences,
              investmentPeriod: e.target.value as 'short' | 'medium' | 'long'
            });
          }}
        >
          <FormControlLabel value="short" control={<Radio />} label="短期" />
          <FormControlLabel value="medium" control={<Radio />} label="中期" />
          <FormControlLabel value="long" control={<Radio />} label="長期" />
        </RadioGroup>
      </FormControl>

      <FormControl component="fieldset">
        <FormLabel component="legend">投資項目</FormLabel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {INVESTMENT_OPTIONS.map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  checked={preferences.investmentPreferences.includes(option)}
                  onChange={(e) => {
                    const newPreferences = e.target.checked
                      ? [...preferences.investmentPreferences, option]
                      : preferences.investmentPreferences.filter((p) => p !== option);
                    setPreferences({
                      ...preferences,
                      investmentPreferences: newPreferences
                    });
                  }}
                />
              }
              label={option}
            />
          ))}
        </Box>
      </FormControl>
    </Box>
  );
};

export default PreferencesManager; 