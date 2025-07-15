-- 建立年度活動表
CREATE TABLE IF NOT EXISTS annual_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 20,
    registration_deadline DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planning',
    year INTEGER NOT NULL,
    cover_image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立活動報名表
CREATE TABLE IF NOT EXISTS activity_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES annual_activities(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    companions INTEGER NOT NULL DEFAULT 0,
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立會員關懷表
CREATE TABLE IF NOT EXISTS member_cares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'other',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    care_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'planned',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_annual_activities_year ON annual_activities(year);
CREATE INDEX IF NOT EXISTS idx_annual_activities_status ON annual_activities(status);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_activity_id ON activity_registrations(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_member_id ON activity_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_member_cares_member_id ON member_cares(member_id);
CREATE INDEX IF NOT EXISTS idx_member_cares_type ON member_cares(type);
CREATE INDEX IF NOT EXISTS idx_member_cares_status ON member_cares(status);

-- 確認表格建立成功
SELECT 'annual_activities' as table_name, COUNT(*) as row_count FROM annual_activities
UNION ALL
SELECT 'activity_registrations' as table_name, COUNT(*) as row_count FROM activity_registrations
UNION ALL
SELECT 'member_cares' as table_name, COUNT(*) as row_count FROM member_cares; 