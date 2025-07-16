import React, { useState, useContext } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Paper
} from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
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
    const { user } = useAuth();

    // 檢查是否為管理者角色
    const isManager = user?.role === 'admin';

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    // 定義標籤頁配置
    const tabs = [
        { label: '年度活動', component: <AnnualActivitiesTab />, index: 0 },
        { label: '會員關懷', component: <MemberCareTab />, index: 1, managerOnly: true },
        { label: '風險管理', component: <RiskManagementTab />, index: 2, managerOnly: true },
        { label: '租金付款狀況', component: <RentalPaymentStatusTab />, index: 3 },
        { label: '資產分潤狀況', component: <AssetProfitStatusTab />, index: 4 }
    ];

    // 過濾標籤頁，非管理者不顯示管理員專用頁面
    const visibleTabs = tabs.filter(tab => !tab.managerOnly || isManager);

    // 調整當前選中的標籤頁索引
    const adjustedCurrentTab = Math.min(currentTab, visibleTabs.length - 1);

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                會員服務管理
            </Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={adjustedCurrentTab}
                        onChange={handleTabChange}
                        aria-label="會員服務管理標籤"
                    >
                        {visibleTabs.map((tab, index) => (
                            <Tab key={tab.index} label={tab.label} />
                        ))}
                    </Tabs>
                </Box>

                {visibleTabs.map((tab, index) => (
                    <TabPanel key={tab.index} value={adjustedCurrentTab} index={index}>
                        {tab.component}
                    </TabPanel>
                ))}
            </Paper>
        </Box>
    );
};

export default MemberServicesManagement; 