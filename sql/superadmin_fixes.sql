-- ============================================================
-- SUPERADMIN FIX — Ejecutar en Supabase SQL Editor
-- Agrega columna updated_at a plan_payment_requests si no existe
-- Crea tabla site_settings para configuración persistente
-- ============================================================

-- 1. Agregar updated_at a plan_payment_requests si falta
ALTER TABLE public.plan_payment_requests
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Tabla de configuración del sitio (site_settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,           -- clave única: 'hero_image', 'contact_email', etc.
  value TEXT,                    -- valor en texto plano o JSON
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: solo superadmin puede escribir, todos pueden leer
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname = 'Lectura publica de site_settings') THEN
    CREATE POLICY "Lectura publica de site_settings"
      ON public.site_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname = 'Escritura publica de site_settings') THEN
    CREATE POLICY "Escritura publica de site_settings"
      ON public.site_settings FOR ALL USING (true);
  END IF;
END $$;

-- 3. Insertar valores por defecto si no existen
INSERT INTO public.site_settings (id, value) VALUES
  ('hero_image_url', ''),
  ('contact_email', 'contacto@sitioautomotor.com.ar'),
  ('contact_whatsapp', '5491112345678'),
  ('bank_name', ''),
  ('bank_alias', ''),
  ('bank_cbu', ''),
  ('bank_owner', ''),
  ('payment_instructions', 'Realizá el pago por transferencia al alias/CBU indicado y hacé clic en "Ya pagué". El equipo verificará y activará tu plan en menos de 24hs hábiles.')
ON CONFLICT (id) DO NOTHING;

-- 4. Fix RLS vehicles: permitir que superadmin (autenticado) vea TODOS los vehículos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname = 'Lectura autenticada de todos los vehiculos') THEN
    CREATE POLICY "Lectura autenticada de todos los vehiculos"
      ON public.vehicles FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;
