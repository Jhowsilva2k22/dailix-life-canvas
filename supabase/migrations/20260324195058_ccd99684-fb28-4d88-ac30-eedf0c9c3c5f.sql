ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS best_streak integer NOT NULL DEFAULT 0;
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS last_completed_date date;