-- Create leaderboard views based on exercise session data
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
        u.name,
        COUNT(DISTINCT DATE_TRUNC('week', es."startedAt")) as total_weeks,
        COALESCE(AVG(es.accuracy), 0) as avg_accuracy,
        COALESCE(SUM(es.accuracy * 100 + CASE WHEN r.id IS NOT NULL THEN 20 ELSE 0 END), 0) as total_score
    FROM users u
    LEFT JOIN "exercise_sessions" es ON u.id = es."userId"
    LEFT JOIN reflections r ON es.id = r."exerciseSessionId"
    WHERE es."createdAt" >= NOW() - INTERVAL '12 months' OR es."createdAt" IS NULL
    GROUP BY u.id, u.name
    HAVING COUNT(es.id) > 0
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
        u.name,
        COUNT(DISTINCT DATE_TRUNC('week', es."startedAt")) as total_weeks,
        COALESCE(AVG(es.accuracy), 0) as avg_accuracy,
        COALESCE(SUM(es.accuracy * 100 + CASE WHEN r.id IS NOT NULL THEN 20 ELSE 0 END), 0) as total_score
    FROM users u
    LEFT JOIN "exercise_sessions" es ON u.id = es."userId"
    LEFT JOIN reflections r ON es.id = r."exerciseSessionId"
    WHERE es."createdAt" >= NOW() - INTERVAL '12 months' OR es."createdAt" IS NULL
    GROUP BY u.id, u.name
    HAVING COUNT(es.id) > 0
) user_stats
ORDER BY avg_accuracy DESC;