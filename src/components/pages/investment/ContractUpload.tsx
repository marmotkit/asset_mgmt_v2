import React, { useState } from 'react';
import {
    Button,
    Box,
    Typography,
    CircularProgress,
    Link,
    IconButton,
} from '@mui/material';
import {
    Upload as UploadIcon,
    Delete as DeleteIcon,
    Description as FileIcon,
} from '@mui/icons-material';
import { ContractFile } from '../../../types/investment';

interface ContractUploadProps {
    contract?: ContractFile;
    onUpload: (file: File) => Promise<void>;
    onDelete: () => Promise<void>;
}

const ContractUpload: React.FC<ContractUploadProps> = ({
    contract,
    onUpload,
    onDelete,
}) => {
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            await onUpload(file);
        } catch (error) {
            console.error('上傳失敗:', error);
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                合約檔案
            </Typography>

            {contract ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileIcon color="primary" />
                    <Link href={contract.url} target="_blank" sx={{ flexGrow: 1 }}>
                        {contract.filename}
                    </Link>
                    <Typography variant="caption" color="textSecondary">
                        ({formatFileSize(contract.fileSize)})
                    </Typography>
                    <IconButton size="small" color="error" onClick={onDelete}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ) : (
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                    disabled={uploading}
                >
                    {uploading ? '上傳中...' : '上傳合約'}
                    <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                    />
                </Button>
            )}
        </Box>
    );
};

export default ContractUpload; 