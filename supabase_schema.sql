-- ==============================================================================
-- School ERP Database Schema for Supabase
-- Paste this entire script into your Supabase SQL Editor and click "RUN".
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('principal', 'teacher', 'class_teacher', 'student', 'parent')),
  class_id TEXT,
  assigned_subjects JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  uid TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  class_id TEXT NOT NULL,
  admission_number TEXT DEFAULT '',
  roll_number TEXT DEFAULT '',
  date_of_birth TEXT DEFAULT '',
  gender TEXT DEFAULT 'Not Specified',
  parent_name TEXT DEFAULT '',
  parent_phone TEXT DEFAULT '',
  added_by TEXT DEFAULT '',
  added_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 3. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 4. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 5. TEACHER CLASS ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.teacher_class_assignments (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  is_class_teacher BOOLEAN DEFAULT TRUE,
  assigned_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
  assigned_by TEXT DEFAULT ''
);

-- 6. TIMETABLES TABLE
CREATE TABLE IF NOT EXISTS public.timetables (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  periods JSONB DEFAULT '[]'::jsonb,
  updated_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
  updated_by TEXT DEFAULT ''
);

-- 7. ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  date TEXT NOT NULL,
  period_number INTEGER NOT NULL,
  subject_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL,
  marked_by TEXT NOT NULL,
  timestamp BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 8. MARKS RECORDS
CREATE TABLE IF NOT EXISTS public.marks_records (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  exam_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  marks_obtained NUMERIC DEFAULT 0,
  total_marks NUMERIC DEFAULT 100,
  graded_by TEXT NOT NULL,
  timestamp BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 9. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all',
  timestamp BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 10. CLASS POSTS
CREATE TABLE IF NOT EXISTS public.class_posts (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 11. FEES
CREATE TABLE IF NOT EXISTS public.fees (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Paid',
  created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments ON public.teacher_class_assignments(teacher_id, class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance_records(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_class_subject ON public.marks_records(class_id, subject_name, exam_name);
CREATE INDEX IF NOT EXISTS idx_marks_student ON public.marks_records(student_id);
CREATE INDEX IF NOT EXISTS idx_announcements_timestamp ON public.announcements(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_class_posts_class_timestamp ON public.class_posts(class_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_timetables_class_day ON public.timetables(class_id, day_of_week);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- POLICIES (Allow authenticated users and service_role full access)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.%I', tbl);
    EXECUTE format('CREATE POLICY "Allow all for authenticated users" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);
    
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for service role" ON public.%I', tbl);
    EXECUTE format('CREATE POLICY "Allow all for service role" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', tbl);

    EXECUTE format('DROP POLICY IF EXISTS "Allow read for anon" ON public.%I', tbl);
    EXECUTE format('CREATE POLICY "Allow read for anon" ON public.%I FOR SELECT TO anon USING (true)', tbl);
  END LOOP;
END
$$;
