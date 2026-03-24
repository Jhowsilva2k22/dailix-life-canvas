
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS lembrete_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lembrete_horario time WITHOUT TIME ZONE DEFAULT NULL;

ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS lembrete_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lembrete_horario time WITHOUT TIME ZONE DEFAULT NULL;
