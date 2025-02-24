import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { parseExcelFile, parseCsvFile } from '../../../utils/importUtils';
import { User } from '../../../types/user';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (users: Partial<User>[]) => Promise<void>;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  onImport,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<Partial<User>[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrors([]);
    setPreview([]);

    try {
      const result = file.name.endsWith('.csv')
        ? await parseCsvFile(file)
        : await parseExcelFile(file);

      if (!result.success || !result.data) {
        setErrors(result.errors || ['檔案解析失敗']);
        return;
      }

      setPreview(result.data);
    } catch (error) {
      setErrors(['檔案處理過程發生錯誤']);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setLoading(true);
    try {
      await onImport(preview);
      onClose();
    } catch (error) {
      setErrors(['匯入過程發生錯誤']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>匯入會員資料</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            請選擇 Excel (.xlsx) 或 CSV 檔案進行匯入。檔案必須包含以下欄位：
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="必填欄位：帳號、電子郵件" />
            </ListItem>
            <ListItem>
              <ListItemText primary="選填欄位：姓名、電話、會員等級、狀態" />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 2 }}>
          <input
            accept=".xlsx,.csv"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              disabled={loading}
            >
              選擇檔案
            </Button>
          </label>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">發現以下錯誤：</Typography>
            <List dense>
              {errors.map((error, index) => (
                <ListItem key={index}>
                  <ListItemText primary={error} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {preview.length > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            已成功解析 {preview.length} 筆資料，請點擊「匯入」按鈕開始匯入。
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={loading || preview.length === 0}
        >
          匯入
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog; 