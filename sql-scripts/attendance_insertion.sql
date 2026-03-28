-- attendance_insertion.sql
-- Seeds attendance records for all days in 2026
-- For each branch, one user is absent (no record) each day

WITH RECURSIVE dates AS (
  -- Generate all dates in 2026
  SELECT '2026-01-01'::date AS dt
  UNION ALL
  SELECT (dt + interval '1 day')::date
  FROM dates
  WHERE dt < '2026-12-31'::date
),
branch_users AS (
  -- Get all users with row numbers within their branch
  SELECT 
    email,
    "branchId",
    (ROW_NUMBER() OVER (PARTITION BY "branchId" ORDER BY email) - 1)::int AS user_idx,
    COUNT(*) OVER (PARTITION BY "branchId")::int AS users_in_branch
  FROM "User"
),
attendance_data AS (
  SELECT 
    bu.email,
    bu."branchId",
    d.dt,
    bu.user_idx,
    -- Calculate which user index is absent for this day/branch
    -- Using day of year mod number of users in branch (rotates through users)
    ((EXTRACT(DOY FROM d.dt)::int - 1) % bu.users_in_branch) AS absent_idx,
    -- Generate a pseudo-random time seed based on hash of email + date for reproducibility
    ('x' || substr(md5(bu.email || d.dt::text), 1, 8))::bit(32)::int AS time_seed
  FROM dates d
  CROSS JOIN branch_users bu
)
INSERT INTO "Attendance" ("userId", "dateTime")
SELECT 
  email,
  -- Timestamp: date + time between 06:00:00 and 17:59:59 (12-hour window)
  dt + interval '6 hours' + (abs(time_seed) % 43200) * interval '1 second'
FROM attendance_data
WHERE user_idx != absent_idx
ORDER BY dt, "branchId", email;
