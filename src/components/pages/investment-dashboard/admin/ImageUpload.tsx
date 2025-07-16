import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Card,
    CardMedia,
    IconButton,
    Grid,
    Chip,
    Alert,
    CircularProgress,
    Paper,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Photo as PhotoIcon,
} from '@mui/icons-material';
import { InvestmentImage } from '../../../../types/investment-opportunity';

// 簡化的圖片類型，用於上傳時（還沒有 investment_id）
interface UploadImage {
    image_url: string;
    image_type: 'main' | 'gallery' | 'document';
    sort_order: number;
}

interface ImageUploadProps {
    images: InvestmentImage[];
    onImagesChange: (images: UploadImage[]) => void;
    onImageDelete?: (imageId: string) => void;
    maxImages?: number;
    acceptedTypes?: string[];
    maxFileSize?: number; // MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    images = [],
    onImagesChange,
    onImageDelete,
    maxImages = 10,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize = 5
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files: FileList) => {
        setError(null);
        setUploading(true);

        try {
            const newImages: UploadImage[] = [];
            const fileArray = Array.from(files);

            // 檢查檔案數量限制
            if (images.length + fileArray.length > maxImages) {
                throw new Error(`最多只能上傳 ${maxImages} 張圖片`);
            }

            for (const file of fileArray) {
                // 檢查檔案類型
                if (!acceptedTypes.includes(file.type)) {
                    throw new Error(`不支援的檔案類型: ${file.type}`);
                }

                // 檢查檔案大小
                if (file.size > maxFileSize * 1024 * 1024) {
                    throw new Error(`檔案大小不能超過 ${maxFileSize}MB`);
                }

                // 轉換為 base64
                const base64 = await fileToBase64(file);
                newImages.push({
                    image_url: base64,
                    image_type: 'gallery',
                    sort_order: images.length + newImages.length
                });
            }

            onImagesChange([...images.map(img => ({
                image_url: img.image_url,
                image_type: img.image_type,
                sort_order: img.sort_order
            })), ...newImages]);

        } catch (err) {
            setError(err instanceof Error ? err.message : '上傳失敗');
        } finally {
            setUploading(false);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageDelete = (index: number) => {
        const newImages = images.filter((_, i) => i !== index).map(img => ({
            image_url: img.image_url,
            image_type: img.image_type,
            sort_order: img.sort_order
        }));
        onImagesChange(newImages);
    };

    const handleImageTypeChange = (index: number, newType: 'main' | 'gallery' | 'document') => {
        const newImages = images.map((img, i) => ({
            image_url: img.image_url,
            image_type: i === index ? newType : img.image_type,
            sort_order: img.sort_order
        }));
        onImagesChange(newImages);
    };

    const getImageTypeLabel = (type: string) => {
        switch (type) {
            case 'main': return '主圖';
            case 'gallery': return '相簿';
            case 'document': return '文件';
            default: return type;
        }
    };

    const getImageTypeColor = (type: string) => {
        switch (type) {
            case 'main': return 'primary';
            case 'gallery': return 'success';
            case 'document': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Box>
            {/* 錯誤訊息 */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* 上傳區域 */}
            {images.length < maxImages && (
                <Paper
                    sx={{
                        border: '2px dashed',
                        borderColor: dragActive ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: dragActive ? 'primary.50' : 'grey.50',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'primary.50',
                        }
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={acceptedTypes.join(',')}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {uploading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <CircularProgress size={40} sx={{ mb: 2 }} />
                            <Typography>上傳中...</Typography>
                        </Box>
                    ) : (
                        <Box>
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                拖拽圖片到這裡或點擊上傳
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                支援 JPG、PNG、WebP 格式，單檔最大 {maxFileSize}MB
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                sx={{ mt: 2 }}
                            >
                                選擇圖片
                            </Button>
                        </Box>
                    )}
                </Paper>
            )}

            {/* 圖片列表 */}
            {images.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        已上傳圖片 ({images.length}/{maxImages})
                    </Typography>
                    <Grid container spacing={2}>
                        {images.map((image, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={image.id || index}>
                                <Card sx={{ position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={image.image_url}
                                        alt={`圖片 ${index + 1}`}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <Box sx={{ p: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Chip
                                                label={getImageTypeLabel(image.image_type)}
                                                color={getImageTypeColor(image.image_type) as any}
                                                size="small"
                                            />
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleImageDelete(index)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {(['main', 'gallery', 'document'] as const).map((type) => (
                                                <Chip
                                                    key={type}
                                                    label={getImageTypeLabel(type)}
                                                    size="small"
                                                    variant={image.image_type === type ? 'filled' : 'outlined'}
                                                    color={getImageTypeColor(type) as any}
                                                    onClick={() => handleImageTypeChange(index, type)}
                                                    sx={{ cursor: 'pointer' }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default ImageUpload; 