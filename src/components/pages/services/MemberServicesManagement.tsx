import React, { useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Paper
} from '@mui/material';
import AnnualActivitiesTab from './AnnualActivitiesTab';
import MemberCareTab from './MemberCareTab';
import RiskManagementTab from './RiskManagementTab';
import RentalPaymentStatusTab from './RentalPaymentStatusTab';
import AssetProfitStatusTab from './AssetProfitStatusTab';

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
            id={`services-tabpanel-${index}`}
            aria-labelledby={`services-tab-${index}`}
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

interface MemberServicesManagementProps {
    initialTab?: number;
}

const MemberServicesManagement: React.FC<MemberServicesManagementProps> = ({ initialTab = 0 }) => {
    const [currentTab, setCurrentTab] = useState(initialTab);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                會員服務管理
            </Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        aria-label="會員服務管理標籤"
                    >
                        <Tab label="年度活動" />
                        <Tab label="會員關懷" />
                        <Tab label="風險管理" />
                        <Tab label="租金付款狀況" />
                        <Tab label="資產分潤狀況" />
                    </Tabs>
                </Box>

                <TabPanel value={currentTab} index={0}>
                    <AnnualActivitiesTab />
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    <MemberCareTab />
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                    <RiskManagementTab />
                </TabPanel>

                <TabPanel value={currentTab} index={3}>
                    <RentalPaymentStatusTab />
                </TabPanel>

                <TabPanel value={currentTab} index={4}>
                    <AssetProfitStatusTab />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default MemberServicesManagement; 