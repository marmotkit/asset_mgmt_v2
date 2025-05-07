import React, { useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    useTheme,
    Paper,
    Container
} from '@mui/material';
import {
    Book as BookIcon,
    MonetizationOn as MonetizationOnIcon,
    PriceCheck as PriceCheckIcon,
    EventNote as EventNoteIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import JournalTab from './tabs/JournalTab';
import ReceivablesTab from './tabs/ReceivablesTab';
import PayablesTab from './tabs/PayablesTab';
import MonthlyClosingTab from './tabs/MonthlyClosingTab';
import FinancialReportsTab from './tabs/FinancialReportsTab';

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
            style={{ paddingTop: '1rem' }}
        >
            {value === index && (
                <Box>
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
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="xl">
            <Box mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    帳務管理
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    管理財務記錄、應收應付帳款及查看財務報表
                </Typography>
            </Box>

            <Paper elevation={3}>
                <Box sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: theme.palette.background.paper
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="accounting management tabs"
                    >
                        <Tab
                            icon={<BookIcon />}
                            label="日記帳"
                            {...a11yProps(0)}
                        />
                        <Tab
                            icon={<MonetizationOnIcon />}
                            label="應收帳款"
                            {...a11yProps(1)}
                        />
                        <Tab
                            icon={<PriceCheckIcon />}
                            label="應付帳款"
                            {...a11yProps(2)}
                        />
                        <Tab
                            icon={<EventNoteIcon />}
                            label="月結"
                            {...a11yProps(3)}
                        />
                        <Tab
                            icon={<AssessmentIcon />}
                            label="財務報表"
                            {...a11yProps(4)}
                        />
                    </Tabs>
                </Box>

                <Box sx={{ p: 2 }}>
                    <TabPanel value={tabValue} index={0}>
                        <JournalTab />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <ReceivablesTab />
                    </TabPanel>
                    <TabPanel value={tabValue} index={2}>
                        <PayablesTab />
                    </TabPanel>
                    <TabPanel value={tabValue} index={3}>
                        <MonthlyClosingTab />
                    </TabPanel>
                    <TabPanel value={tabValue} index={4}>
                        <FinancialReportsTab />
                    </TabPanel>
                </Box>
            </Paper>
        </Container>
    );
};

export default AccountingManagement; 