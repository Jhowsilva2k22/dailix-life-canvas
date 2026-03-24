
CREATE TABLE public.insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  texto text NOT NULL,
  texto_curto text,
  categoria text NOT NULL DEFAULT 'foco',
  ativo boolean NOT NULL DEFAULT true,
  publicado_em date NOT NULL DEFAULT CURRENT_DATE,
  ordem integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active insights"
  ON public.insights
  FOR SELECT
  TO authenticated
  USING (ativo = true);
