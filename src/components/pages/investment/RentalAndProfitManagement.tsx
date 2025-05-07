import React, { useState, useEffect } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Paper,
} from '@mui/material';

import RentalStandardTab from './RentalStandardTab';
import ProfitSharingStandardTab from './ProfitSharingStandardTab';
import RentalPaymentTab from './RentalPaymentTab';
import MemberProfitTab from './MemberProfitTab';
import ReportTab from './ReportTab';
import { Investment } from '../../../types/investment';
import { ApiService } from '../../../services';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface RentalAndProfitManagementProps {
    initialTab?: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`rental-tabpanel-${index}`}
            aria-labelledby={`rental-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const RentalAndProfitManagement: React.FC<RentalAndProfitManagementProps> = ({ initialTab = 0 }) => {
    const [currentTab, setCurrentTab] = useState(initialTab);
    const [investments, setInvestments] = useState<Investment[]>([]);

    useEffect(() => {
        loadInvestments();
    }, []);

    // 當 initialTab 變化時更新當前標籤
    useEffect(() => {
        if (initialTab !== undefined) {
            setCurrentTab(initialTab);
        }
    }, [initialTab]);

    const loadInvestments = async () => {
        try {
            const data = await ApiService.getInvestments();
            setInvestments(data);
        } catch (error) {
            console.error('載入投資項目失敗:', error);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        aria-label="租賃與分潤管理標籤"
                    >
                        <Tab label="租賃標準設定" />
                        <Tab label="分潤標準設定" />
                        <Tab label="租金收款管理" />
                        <Tab label="會員分潤管理" />
                        <Tab label="統計報表" />
                    </Tabs>
                </Box>

                <TabPanel value={currentTab} index={0}>
                    <RentalStandardTab investments={investments} />
                </TabPanel>
                <TabPanel value={currentTab} index={1}>
                    <ProfitSharingStandardTab investments={investments} />
                </TabPanel>
                <TabPanel value={currentTab} index={2}>
                    <RentalPaymentTab investments={investments} />
                </TabPanel>
                <TabPanel value={currentTab} index={3}>
                    <MemberProfitTab investments={investments} />
                </TabPanel>
                <TabPanel value={currentTab} index={4}>
                    <ReportTab investments={investments} />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default RentalAndProfitManagement;
