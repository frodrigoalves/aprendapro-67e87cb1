
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published pages"
  ON public.pages FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Authenticated can read all pages"
  ON public.pages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert pages"
  ON public.pages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update pages"
  ON public.pages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete pages"
  ON public.pages FOR DELETE
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
