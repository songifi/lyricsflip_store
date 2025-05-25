-- Create contests table
CREATE TABLE contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rules TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'competition',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    voting_type VARCHAR(50) NOT NULL DEFAULT 'public',
    submission_start_date TIMESTAMP NOT NULL,
    submission_end_date TIMESTAMP NOT NULL,
    voting_start_date TIMESTAMP NOT NULL,
    voting_end_date TIMESTAMP NOT NULL,
    announcement_date TIMESTAMP,
    max_submissions INTEGER DEFAULT 0,
    max_submissions_per_user INTEGER DEFAULT 1,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    allowed_genres TEXT[],
    required_tags TEXT[],
    max_track_duration INTEGER DEFAULT 180,
    min_track_duration INTEGER DEFAULT 10,
    cover_image_url TEXT,
    banner_image_url TEXT,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    participant_count INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    metadata JSONB,
    organizer_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create contest_submissions table
CREATE TABLE contest_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    vote_count INTEGER DEFAULT 0,
    average_rating DECIMAL(10,2) DEFAULT 0,
    rank INTEGER DEFAULT 0,
    is_winner BOOLEAN DEFAULT false,
    prize_position INTEGER,
    rejection_reason TEXT,
    metadata JSONB,
    contest_id UUID NOT NULL,
    user_id UUID NOT NULL,
    track_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    UNIQUE(contest_id, user_id)
);

-- Create contest_votes table
CREATE TABLE contest_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL DEFAULT 'like',
    rating DECIMAL(3,2),
    is_positive BOOLEAN DEFAULT true,
    comment TEXT,
    weight DECIMAL(5,2) DEFAULT 1.0,
    contest_id UUID NOT NULL,
    submission_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (submission_id) REFERENCES contest_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(contest_id, submission_id, user_id)
);

-- Create contest_prizes table
CREATE TABLE contest_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'cash',
    cash_value DECIMAL(10,2),
    image_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    awarded_at TIMESTAMP,
    claimed_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB,
    contest_id UUID NOT NULL,
    winner_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create contest_jury table
CREATE TABLE contest_jury (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) NOT NULL DEFAULT 'invited',
    voting_weight DECIMAL(5,2) DEFAULT 1.0,
    expertise TEXT,
    bio TEXT,
    invited_at TIMESTAMP,
    responded_at TIMESTAMP,
    contest_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(contest_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_type ON contests(type);
CREATE INDEX idx_contests_organizer ON contests(organizer_id);
CREATE INDEX idx_contests_dates ON contests(submission_start_date, submission_end_date, voting_start_date, voting_end_date);
CREATE INDEX idx_contests_featured ON contests(is_featured) WHERE is_featured = true;

CREATE INDEX idx_submissions_contest ON contest_submissions(contest_id);
CREATE INDEX idx_submissions_user ON contest_submissions(user_id);
CREATE INDEX idx_submissions_status ON contest_submissions(status);
CREATE INDEX idx_submissions_rank ON contest_submissions(rank);

CREATE INDEX idx_votes_contest ON contest_votes(contest_id);
CREATE INDEX idx_votes_submission ON contest_votes(submission_id);
CREATE INDEX idx_votes_user ON contest_votes(user_id);

CREATE INDEX idx_prizes_contest ON contest_prizes(contest_id);
CREATE INDEX idx_prizes_winner ON contest_prizes(winner_id);
CREATE INDEX idx_prizes_status ON contest_prizes(status);

CREATE INDEX idx_jury_contest ON contest_jury(contest_id);
CREATE INDEX idx_jury_user ON contest_jury(user_id);
CREATE INDEX idx_jury_status ON contest_jury(status);
