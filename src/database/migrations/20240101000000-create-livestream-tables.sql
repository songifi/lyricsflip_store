-- Create livestreams table
CREATE TABLE livestreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'concert',
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    scheduled_start_time TIMESTAMP NOT NULL,
    actual_start_time TIMESTAMP,
    end_time TIMESTAMP,
    max_viewers INTEGER DEFAULT 0,
    ticket_price DECIMAL(10,2),
    is_pay_per_view BOOLEAN DEFAULT false,
    is_chat_enabled BOOLEAN DEFAULT true,
    is_recording_enabled BOOLEAN DEFAULT true,
    max_quality VARCHAR(10) DEFAULT '1080p',
    thumbnail_url VARCHAR(500),
    stream_key VARCHAR(100),
    rtmp_url VARCHAR(500),
    hls_url VARCHAR(500),
    stream_settings JSONB,
    metadata JSONB,
    artist_id UUID NOT NULL,
    event_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Create livestream_recordings table
CREATE TABLE livestream_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    duration INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'processing',
    recording_start_time TIMESTAMP NOT NULL,
    recording_end_time TIMESTAMP NOT NULL,
    metadata JSONB,
    live_stream_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (live_stream_id) REFERENCES livestreams(id) ON DELETE CASCADE
);

-- Create livestream_analytics table
CREATE TABLE livestream_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP NOT NULL,
    viewer_count INTEGER DEFAULT 0,
    chat_messages INTEGER DEFAULT 0,
    average_watch_time DECIMAL(5,2) DEFAULT 0,
    quality_metrics JSONB,
    geographic_data JSONB,
    live_stream_id UUID NOT NULL,
    user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (live_stream_id) REFERENCES livestreams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create livestream_payments table
CREATE TABLE livestream_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    payment_intent_id VARCHAR(100),
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP,
    payment_metadata JSONB,
    live_stream_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (live_stream_id) REFERENCES livestreams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create livestream_chat table
CREATE TABLE livestream_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text',
    is_moderated BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    metadata JSONB,
    live_stream_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (live_stream_id) REFERENCES livestreams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_livestreams_artist_id ON livestreams(artist_id);
CREATE INDEX idx_livestreams_status ON livestreams(status);
CREATE INDEX idx_livestreams_scheduled_start_time ON livestreams(scheduled_start_time);
CREATE INDEX idx_livestream_analytics_live_stream_id ON livestream_analytics(live_stream_id);
CREATE INDEX idx_livestream_analytics_timestamp ON livestream_analytics(timestamp);
CREATE INDEX idx_livestream_payments_user_id ON livestream_payments(user_id);
CREATE INDEX idx_livestream_payments_live_stream_id ON livestream_payments(live_stream_id);
CREATE INDEX idx_livestream_chat_live_stream_id ON livestream_chat(live_stream_id);
CREATE INDEX idx_livestream_chat_created_at ON livestream_chat(created_at);

-- Add updated_at trigger for livestreams
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_livestreams_updated_at 
    BEFORE UPDATE ON livestreams 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
