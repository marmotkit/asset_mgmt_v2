import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import JournalTab from './tabs/JournalTab';
import ReceivablesTab from './tabs/ReceivablesTab';
import PayablesTab from './tabs/PayablesTab';
import MonthlyClosingTab from './tabs/MonthlyClosingTab';
import FinancialReportsTab from './tabs/FinancialReportsTab';
import AccountingIntegrationTab from './tabs/AccountingIntegrationTab';

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
            id={`accounting-tabpanel-${index}`}
            aria-labelledby={`accounting-tab-${index}`}
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

function a11yProps(index: number) {
    return {
        id: `accounting-tab-${index}`,
        'aria-controls': `accounting-tabpanel-${index}`,
    };
}

const AccountingManagement: React.FC = () => {
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                帳務管理
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="帳務管理功能">
                    <Tab label="日記帳" {...a11yProps(0)} />
                    <Tab label="應收帳款" {...a11yProps(1)} />
                    <Tab label="應付帳款" {...a11yProps(2)} />
                    <Tab label="月結" {...a11yProps(3)} />
                    <Tab label="財務報表" {...a11yProps(4)} />
                    <Tab label="資料整合" {...a11yProps(5)} />
                </Tabs>
            </Box>

            <TabPanel value={value} index={0}>
                <JournalTab />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <ReceivablesTab />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <PayablesTab />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <MonthlyClosingTab />
            </TabPanel>
            <TabPanel value={value} index={4}>
                <FinancialReportsTab />
            </TabPanel>
            <TabPanel value={value} index={5}>
                <AccountingIntegrationTab />
            </TabPanel>
        </Box>
    );
};

export default AccountingManagement; 