import React, { useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Paper,
} from '@mui/material';
import FeeSettings from './FeeSettings';
import FeePaymentStatus from './FeePaymentStatus';
import FeeReminder from './FeeReminder';
import FeeInvoice from './FeeInvoice';
import FeeReport from './FeeReport';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`fee-tabpanel-${index}`}
            aria-labelledby={`fee-tab-${index}`}
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

const FeeManagement: React.FC = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper elevation={2} sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ p: 2 }}>
                    會費管理
                </Typography>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    aria-label="會費管理功能頁籤"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="會費標準設定" />
                    <Tab label="收款狀況" />
                    <Tab label="催繳通知" />
                    <Tab label="發票管理" />
                    <Tab label="會費報表" />
                </Tabs>
            </Paper>

            <TabPanel value={currentTab} index={0}>
                <FeeSettings />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
                <FeePaymentStatus />
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
                <FeeReminder />
            </TabPanel>
            <TabPanel value={currentTab} index={3}>
                <FeeInvoice />
            </TabPanel>
            <TabPanel value={currentTab} index={4}>
                <FeeReport />
            </TabPanel>
        </Box>
    );
};

export default FeeManagement; 