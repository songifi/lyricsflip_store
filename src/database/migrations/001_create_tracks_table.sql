-- Create tracks table migration
CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    artist_id UUID NOT NULL,
    album_id UUID,
    genre_id UUID,
    
    -- Audio File Information
    audio_file_url VARCHAR(500) NOT NULL,
    audio_file_key VARCHAR(500) NOT NULL,
    preview_url VARCHAR(500),
    preview_key VARCHAR(500),
    waveform_url VARCHAR(500),
    
    -- Audio Metadata
    duration INTEGER NOT NULL,
    bitrate INTEGER,
    sample_rate INTEGER,
    format VARCHAR(10) NOT NULL DEFAULT 'mp3',
    file_size BIGINT NOT NULL,
    checksum VARCHAR(32),
    
    -- Track Identification
    isrc VARCHAR(12) UNIQUE,
    upc VARCHAR(255),
    track_number INTEGER,
    disc_number INTEGER,
    
    -- Lyrics and Credits
    lyrics TEXT,
    credits JSONB,
    
    -- Publishing Information
    release_date DATE,
    label VARCHAR(255),
    publisher VARCHAR(255),
    copyright_info JSONB,
    
    -- Streaming and Analytics
    play_count BIGINT DEFAULT 0,
    download_count BIGINT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    
    -- Status and Visibility
    status VARCHAR(20) DEFAULT 'draft',
    is_active BOOLEAN DEFAULT true,
    is_explicit BOOLEAN DEFAULT false,
    allow_download BOOLEAN DEFAULT true,
    allow_streaming BOOLEAN DEFAULT true,
    
    -- Pricing
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Processing Information
    processing_status JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_tracks_artist FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tracks_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL,
    CONSTRAINT fk_tracks_genre FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE SET NULL,
    
    -- Check Constraints
    CONSTRAINT chk_tracks_status CHECK (status IN ('draft', 'processing', 'published', 'archived')),
    CONSTRAINT chk_tracks_format CHECK (format IN ('mp3', 'wav', 'flac', 'aac', 'ogg')),
    CONSTRAINT chk_tracks_duration CHECK (duration > 0),
    CONSTRAINT chk_tracks_file_size CHECK (file_size > 0),
    CONSTRAINT chk_tracks_price CHECK (price >= 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_tracks_artist_status ON tracks(artist_id, status);
CREATE INDEX idx_tracks_album ON tracks(album_id);
CREATE INDEX idx_tracks_genre ON tracks(genre_id);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_release_date ON tracks(release_date);
CREATE INDEX idx_tracks_created_at ON tracks(created_at);
CREATE INDEX idx_tracks_play_count ON tracks(play_count);

-- Create unique index for ISRC when not null
CREATE UNIQUE INDEX idx_tracks_isrc ON tracks(isrc) WHERE isrc IS NOT NULL;

-- Create full-text search index for title
CREATE INDEX idx_tracks_title_search ON tracks USING gin(to_tsvector('english', title));

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tracks_updated_at
    BEFORE UPDATE ON tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_tracks_updated_at();
