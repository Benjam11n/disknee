-- Create leaderboard views based on session data
-- These views calculate rankings based on score and accuracy

-- View for leaderboard by score
CREATE OR REPLACE VIEW leaderboard_by_score AS
SELECT
    ROW_NUMBER() OVER (ORDER BY total_score DESC, total_weeks DESC, name ASC) as rank,
    name,
    total_weeks as weeks,
    avg_accuracy::int as accuracyPercentage,
    total_score::int as score
FROM (
    SELECT
        'Donald Duck' as name,
        COUNT(DISTINCT DATE_TRUNC('week', "startedAt")) as total_weeks,
        COALESCE(AVG(accuracy), 0) as avg_accuracy,
        COALESCE(SUM(accuracy * 100 + CASE WHEN r.id IS NOT NULL THEN 20 ELSE 0 END), 0) as total_score
    FROM sessions s
    LEFT JOIN reflections r ON s.id = r."sessionId"
    WHERE s."createdAt" >= NOW() - INTERVAL '12 months'
) user_stats
ORDER BY total_score DESC;

-- View for leaderboard by accuracy
CREATE OR REPLACE VIEW leaderboard_by_accuracy AS
SELECT
    ROW_NUMBER() OVER (ORDER BY avg_accuracy DESC, total_weeks DESC, name ASC) as rank,
    name,
    total_weeks as weeks,
    avg_accuracy::int as accuracyPercentage,
    total_score::int as score
FROM (
    SELECT
        'Donald Duck' as name,
        COUNT(DISTINCT DATE_TRUNC('week', "startedAt")) as total_weeks,
        COALESCE(AVG(accuracy), 0) as avg_accuracy,
        COALESCE(SUM(accuracy * 100 + CASE WHEN r.id IS NOT NULL THEN 20 ELSE 0 END), 0) as total_score
    FROM sessions s
    LEFT JOIN reflections r ON s.id = r."sessionId"
    WHERE s."createdAt" >= NOW() - INTERVAL '12 months'
) user_stats
ORDER BY avg_accuracy DESC;

-- Insert some sample data for testing (exerciseId optional)
INSERT INTO sessions (id, "startedAt", "endedAt", duration, "repsCompleted", accuracy, "maxAccuracy", "createdAt")
VALUES
    ('session-1', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes', 300, 10, 90, 95, NOW() - INTERVAL '1 day'),
    ('session-2', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '4 minutes', 240, 8, 85, 88, NOW() - INTERVAL '3 days'),
    ('session-3', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '6 minutes', 360, 12, 95, 98, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Insert reflections for some sessions to get the +20 bonus
INSERT INTO reflections (id, "sessionId", rating, fatigue, feedback, "createdAt")
VALUES
    ('reflection-1', 'session-1', 4, 3, 'Good session', NOW() - INTERVAL '1 day'),
    ('reflection-3', 'session-3', 5, 2, 'Excellent!', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;