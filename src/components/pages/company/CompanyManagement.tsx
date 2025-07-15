import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    IconButton,
    Toolbar,
    TextField,
    InputAdornment,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { Company } from '../../../types/company';
import { companyService } from '../../../services/companyService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import CompanyDetailDialog from './CompanyDetailDialog';

const CompanyManagement: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const data = await companyService.getCompanies();
            setCompanies(data);
        } catch (err) {
            setError('載入公司資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCompany = () => {
        setSelectedCompany(null);
        setDialogOpen(true);
    };

    const handleEditCompany = (company: Company) => {
        setSelectedCompany(company);
        setDialogOpen(true);
    };

    const handleDeleteCompany = async (id: string) => {
        if (!window.confirm('確定要刪除此公司資料？')) return;

        setLoading(true);
        try {
            await companyService.deleteCompany(id);
            await loadCompanies();
        } catch (err) {
            setError('刪除公司失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCompany = async (companyData: Partial<Company>) => {
        setLoading(true);
        try {
            if (companyData.id) {
                await companyService.updateCompany(companyData.id, companyData);
            } else {
                await companyService.createCompany(companyData);
            }
            await loadCompanies();
            setDialogOpen(false);
        } catch (error) {
            setError('儲存公司資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(company => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        return (
            company.companyNo.toLowerCase().includes(searchLower) ||
            company.name.toLowerCase().includes(searchLower) ||
            company.nameEn?.toLowerCase().includes(searchLower) ||
            company.taxId.toLowerCase().includes(searchLower) ||
            company.address.toLowerCase().includes(searchLower) ||
            company.fax?.toLowerCase().includes(searchLower) ||
            company.contact.name.toLowerCase().includes(searchLower) ||
            company.contact.email.toLowerCase().includes(searchLower) ||
            company.contact.phone.toLowerCase().includes(searchLower)
        );
    });

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <Box sx={{ p: 3 }}>
            <Toolbar sx={{ mb: 2 }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    公司資訊管理
                </Typography>

                <TextField
                    size="small"
                    placeholder="搜尋公司..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mr: 2, width: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchQuery('')}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddCompany}
                >
                    新增公司
                </Button>
            </Toolbar>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>公司編號</TableCell>
                            <TableCell>統一編號</TableCell>
                            <TableCell>公司名稱</TableCell>
                            <TableCell>英文簡稱</TableCell>
                            <TableCell>產業類別</TableCell>
                            <TableCell>聯絡人</TableCell>
                            <TableCell>聯絡電話</TableCell>
                            <TableCell>傳真</TableCell>
                            <TableCell>電子郵件</TableCell>
                            <TableCell>備註</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCompanies.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell>{company.companyNo}</TableCell>
                                <TableCell>{company.taxId}</TableCell>
                                <TableCell>{company.name}</TableCell>
                                <TableCell>{company.nameEn}</TableCell>
                                <TableCell>
                                    {company.industry && (
                                        <Chip label={company.industry} color="primary" size="small" />
                                    )}
                                </TableCell>
                                <TableCell>{company.contact.name}</TableCell>
                                <TableCell>{company.contact.phone}</TableCell>
                                <TableCell>{company.fax || '-'}</TableCell>
                                <TableCell>{company.contact.email}</TableCell>
                                <TableCell>{company.note || '-'}</TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEditCompany(company)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteCompany(company.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <CompanyDetailDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                companyData={selectedCompany}
                onSave={handleSaveCompany}
            />
        </Box>
    );
};

export default CompanyManagement; 