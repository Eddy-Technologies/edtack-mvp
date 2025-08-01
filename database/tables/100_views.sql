-- Database Views

-- all_users View (Now joins user_infos to get profile data)
CREATE OR REPLACE VIEW all_users AS
SELECT
  ui.id AS user_info_id,
  ui.first_name,
  ui.last_name,
  ui.gender,
  ui.level_type,
  ui.payment_customer_id,
  CASE
    WHEN ui.user_id IS NOT NULL THEN 'auth_' || ui.user_id::text
    WHEN ui.app_user_id IS NOT NULL THEN 'app_' || ui.app_user_id::text
    ELSE NULL
  END AS prefixed_auth_id,
  CASE
    WHEN ui.user_id IS NOT NULL THEN au.email
    ELSE NULL
  END AS email,
  CASE
    WHEN ui.app_user_id IS NOT NULL THEN appu.username
    ELSE NULL
  END AS username,
  CASE
    WHEN ui.user_id IS NOT NULL THEN 'auth'
    WHEN ui.app_user_id IS NOT NULL THEN 'app'
    ELSE NULL
  END AS auth_source,
  ui.created_at,
  ui.updated_at
FROM user_infos ui
LEFT JOIN auth.users au ON ui.user_id = au.id
LEFT JOIN app_users appu ON ui.app_user_id = appu.id;

-- Leaderboard View (No changes needed, as it doesn't directly select these timestamps)
CREATE OR REPLACE VIEW leaderboard AS
WITH combined_attempts AS (
  SELECT
    uq.user_info_id,
    COUNT(uq.id) AS total_questions_attempted,
    SUM(uq.duration_seconds) AS total_time_spent,
    AVG(uq.duration_seconds) AS avg_time_per_question,
    COALESCE(SUM(uq.score), 0) AS total_score
  FROM user_question_attempts uq
  GROUP BY uq.user_info_id
)
SELECT
  ui.id AS user_info_id,
  ui.first_name,
  ui.last_name,
  ui.level_type,
  ca.total_questions_attempted,
  ca.total_time_spent,
  ca.avg_time_per_question,
  ca.total_score,
  RANK() OVER (
    ORDER BY ca.total_questions_attempted DESC, ca.total_score DESC, ca.avg_time_per_question ASC
  ) AS rank
FROM user_infos ui
JOIN combined_attempts ca ON ui.id = ca.user_info_id
WHERE ui.is_active = TRUE -- Only include active users in leaderboard
ORDER BY rank;