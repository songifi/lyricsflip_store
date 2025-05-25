-- Performance optimization indexes for music streaming platform

-- Tracks table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_play_count_desc ON tracks (play_count DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_created_at_desc ON tracks (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_artist_id ON tracks (artist_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_album_id ON tracks (album_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_genre_id ON tracks (genre_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_duration ON tracks (duration);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_artist_play_count ON tracks (artist_id, play_count DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_album_track_number ON tracks (album_id, track_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_genre_play_count ON tracks (genre_id, play_count DESC);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_title_fts ON tracks USING gin(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artists_name_fts ON artists USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_albums_title_fts ON albums USING gin(to_tsvector('english', title));

-- Albums table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_albums_artist_id ON albums (artist_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_albums_release_date_desc ON albums (release_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_albums_genre_id ON albums (genre_id);

-- Artists table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artists_name ON artists (name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artists_created_at_desc ON artists (created_at DESC);

-- User listening history indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listening_history_user_id ON user_listening_history (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listening_history_track_id ON user_listening_history (track_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listening_history_listened_at_desc ON user_listening_history (listened_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listening_history_user_track ON user_listening_history (user_id, track_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listening_history_user_listened_at ON user_listening_history (user_id, listened_at DESC);

-- Playlists indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlists_user_id ON playlists (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlists_created_at_desc ON playlists (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlists_is_public ON playlists (is_public);

-- Playlist tracks indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks (playlist_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlist_tracks_track_id ON playlist_tracks (track_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlist_tracks_position ON playlist_tracks (playlist_id, position);

-- User preferences indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_user_id ON user_preferences (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_genre ON user_preferences (genre);

-- Streaming analytics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaming_analytics_track_id ON streaming_analytics (track_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaming_analytics_timestamp ON streaming_analytics (timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaming_analytics_user_id ON streaming_analytics (user_id);

-- Performance monitoring indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_logs_timestamp ON performance_logs (timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_logs_endpoint ON performance_logs (endpoint);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_logs_response_time ON performance_logs (response_time DESC);

-- Partial indexes for active/popular content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_popular ON tracks (play_count DESC) WHERE play_count > 1000;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_recent_popular ON tracks (created_at DESC, play_count DESC) WHERE created_at > NOW() - INTERVAL '30 days';

-- Covering indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracks_search_covering ON tracks (title, artist_id, album_id, play_count DESC, created_at DESC);

-- Enable pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create materialized view for popular tracks (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_tracks_mv AS
SELECT 
    t.id,
    t.title,
    t.artist_id,
    t.album_id,
    t.play_count,
    a.name as artist_name,
    al.title as album_title
FROM tracks t
JOIN artists a ON t.artist_id = a.id
JOIN albums al ON t.album_id = al.id
WHERE t.play_count > 100
ORDER BY t.play_count DESC, t.created_at DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_tracks_mv_id ON popular_tracks_mv (id);
CREATE INDEX IF NOT EXISTS idx_popular_tracks_mv_play_count ON popular_tracks_mv (play_count DESC);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_popular_tracks_mv()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_tracks_mv;
END;
$$ LANGUAGE plpgsql;

-- Schedule materialized view refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-popular-tracks', '*/15 * * * *', 'SELECT refresh_popular_tracks_mv();');
