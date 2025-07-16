"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const ImageUpload = ({ images = [], onImagesChange, onImageDelete, maxImages = 10, acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'], maxFileSize = 5 }) => {
    const [dragActive, setDragActive] = (0, react_1.useState)(false);
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        }
        else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };
    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };
    const handleFiles = async (files) => {
        setError(null);
        setUploading(true);
        try {
            const newImages = [];
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
                // 壓縮圖片並轉換為 base64
                const compressedBase64 = await compressAndConvertToBase64(file);
                newImages.push({
                    image_url: compressedBase64,
                    image_type: 'gallery',
                    sort_order: images.length + newImages.length
                });
            }
            onImagesChange([...images.map(img => ({
                    image_url: img.image_url,
                    image_type: img.image_type,
                    sort_order: img.sort_order
                })), ...newImages]);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '上傳失敗');
        }
        finally {
            setUploading(false);
        }
    };
    // 壓縮圖片並轉換為 base64
    const compressAndConvertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                // 計算壓縮後的尺寸，最大寬度 800px
                const maxWidth = 800;
                const maxHeight = 600;
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
                canvas.width = width;
                canvas.height = height;
                // 繪製壓縮後的圖片
                ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img, 0, 0, width, height);
                // 轉換為 base64，使用較低的品質
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                // 檢查 base64 長度，如果還是太長就進一步壓縮
                if (compressedBase64.length > 100000) { // 約 100KB
                    const furtherCompressed = canvas.toDataURL('image/jpeg', 0.5);
                    resolve(furtherCompressed);
                }
                else {
                    resolve(compressedBase64);
                }
            };
            img.onerror = () => reject(new Error('圖片載入失敗'));
            // 從檔案建立 URL
            const url = URL.createObjectURL(file);
            img.src = url;
            // 清理 URL
            img.onload = () => URL.revokeObjectURL(url);
        });
    };
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };
    const handleImageDelete = (index) => {
        const newImages = images.filter((_, i) => i !== index).map(img => ({
            image_url: img.image_url,
            image_type: img.image_type,
            sort_order: img.sort_order
        }));
        onImagesChange(newImages);
    };
    const handleImageTypeChange = (index, newType) => {
        const newImages = images.map((img, i) => ({
            image_url: img.image_url,
            image_type: i === index ? newType : img.image_type,
            sort_order: img.sort_order
        }));
        onImagesChange(newImages);
    };
    const getImageTypeLabel = (type) => {
        switch (type) {
            case 'main': return '主圖';
            case 'gallery': return '相簿';
            case 'document': return '文件';
            default: return type;
        }
    };
    const getImageTypeColor = (type) => {
        switch (type) {
            case 'main': return 'primary';
            case 'gallery': return 'success';
            case 'document': return 'warning';
            default: return 'default';
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 2 }, children: error })), images.length < maxImages && ((0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: {
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
                }, onDragEnter: handleDrag, onDragLeave: handleDrag, onDragOver: handleDrag, onDrop: handleDrop, onClick: () => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, children: [(0, jsx_runtime_1.jsx)("input", { ref: fileInputRef, type: "file", multiple: true, accept: acceptedTypes.join(','), onChange: handleFileSelect, style: { display: 'none' } }), uploading ? ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 40, sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "\u4E0A\u50B3\u4E2D..." })] })) : ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(icons_material_1.CloudUpload, { sx: { fontSize: 48, color: 'primary.main', mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u62D6\u62FD\u5716\u7247\u5230\u9019\u88E1\u6216\u9EDE\u64CA\u4E0A\u50B3" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "textSecondary", children: ["\u652F\u63F4 JPG\u3001PNG\u3001WebP \u683C\u5F0F\uFF0C\u55AE\u6A94\u6700\u5927 ", maxFileSize, "MB"] }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), sx: { mt: 2 }, children: "\u9078\u64C7\u5716\u7247" })] }))] })), images.length > 0 && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", gutterBottom: true, children: ["\u5DF2\u4E0A\u50B3\u5716\u7247 (", images.length, "/", maxImages, ")"] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 2, children: images.map((image, index) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: (0, jsx_runtime_1.jsxs)(material_1.Card, { sx: { position: 'relative' }, children: [(0, jsx_runtime_1.jsx)(material_1.CardMedia, { component: "img", height: "200", image: image.image_url, alt: `圖片 ${index + 1}`, sx: { objectFit: 'cover' } }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { p: 1 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Chip, { label: getImageTypeLabel(image.image_type), color: getImageTypeColor(image.image_type), size: "small" }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleImageDelete(index), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', gap: 0.5 }, children: ['main', 'gallery', 'document'].map((type) => ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: getImageTypeLabel(type), size: "small", variant: image.image_type === type ? 'filled' : 'outlined', color: getImageTypeColor(type), onClick: () => handleImageTypeChange(index, type), sx: { cursor: 'pointer' } }, type))) })] })] }) }, image.id || index))) })] }))] }));
};
exports.default = ImageUpload;
