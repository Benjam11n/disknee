CREATE OR REPLACE VIEW "leaderboard_by_score" AS
SELECT
    ROW_NUMBER() OVER (ORDER BY score DESC, name ASC) as rank,
    name,
    weeks,
    "accuracyPercentage",
    score
FROM leaderboard;

-- CreateView
CREATE OR REPLACE VIEW "leaderboard_by_accuracy" AS
SELECT
    ROW_NUMBER() OVER (ORDER BY "accuracyPercentage" DESC, name ASC) as rank,
    name,
    weeks,
    "accuracyPercentage",
    score
FROM leaderboard;