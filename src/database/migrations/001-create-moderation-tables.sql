-- Migration for moderation system tables

-- Moderation cases table
CREATE TABLE moderation_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    violation_types TEXT[] DEFAULT '{}',
    description TEXT,
    metadata JSONB,
    scan_results JSONB,
    confidence_score FLOAT DEFAULT 0,
    is_automated BOOLEAN DEFAULT FALSE,
    reported_by_user_id UUID REFERENCES users(id),
    assigned_to_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Content flags table
CREATE TABLE content_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    violation_type VARCHAR(50) NOT NULL,
    reason TEXT,
    reported_by_user_id UUID NOT NULL REFERENCES users(id),
    is_processed BOOLEAN DEFAULT FALSE,
    moderation_case_id UUID REFERENCES moderation_cases(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Moderation actions table
CREATE TABLE moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderation_case_id UUID NOT NULL REFERENCES moderation_cases(id),
    action_type VARCHAR(50) NOT NULL,
    reason TEXT,
    metadata JSONB,
    performed_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Appeals table
CREATE TABLE appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderation_case_id UUID NOT NULL REFERENCES moderation_cases(id),
    reason TEXT NOT NULL,
    evidence TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    submitted_by_user_id UUID NOT NULL REFERENCES users(id),
    reviewed_by_user_id UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Moderation team members table
CREATE TABLE moderation_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    permissions TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Moderation rules table
CREATE TABLE moderation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    applicable_content_types TEXT[] NOT NULL,
    violation_type VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    confidence_threshold FLOAT DEFAULT 0.8,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Moderation analytics table
CREATE TABLE moderation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    content_type VARCHAR(50),
    violation_type VARCHAR(50),
    status VARCHAR(50),
    total_cases INTEGER DEFAULT 0,
    automated_cases INTEGER DEFAULT 0,
    manual_cases INTEGER DEFAULT 0,
    approved_cases INTEGER DEFAULT 0,
    rejected_cases INTEGER DEFAULT 0,
    appealed_cases INTEGER DEFAULT 0,
    average_processing_time FLOAT DEFAULT 0,
    accuracy_rate FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_moderation_cases_status ON moderation_cases(status);
CREATE INDEX idx_moderation_cases_content ON moderation_cases(content_type, content_id);
CREATE INDEX idx_moderation_cases_assigned ON moderation_cases(assigned_to_user_id);
CREATE INDEX idx_moderation_cases_created_at ON moderation_cases(created_at);

CREATE INDEX idx_content_flags_content ON content_flags(content_type, content_id);
CREATE INDEX idx_content_flags_reporter ON content_flags(reported_by_user_id);
CREATE INDEX idx_content_flags_processed ON content_flags(is_processed);

CREATE INDEX idx_moderation_actions_case ON moderation_actions(moderation_case_id);
CREATE INDEX idx_moderation_actions_performer ON moderation_actions(performed_by_user_id);

CREATE INDEX idx_appeals_case ON appeals(moderation_case_id);
CREATE INDEX idx_appeals_status ON appeals(status);
CREATE INDEX idx_appeals_submitter ON appeals(submitted_by_user_id);

CREATE INDEX idx_team_members_user ON moderation_team_members(user_id);
CREATE INDEX idx_team_members_active ON moderation_team_members(is_active);

CREATE INDEX idx_analytics_date ON moderation_analytics(date);
CREATE INDEX idx_analytics_content_type ON moderation_analytics(content_type);
