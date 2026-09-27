-- ====================================================================
-- SCRIPT COMPLETO PARA EJECUTAR EN SUPABASE SQL EDITOR
-- Proyecto: Sitio Automotor
-- INSTRUCCIONES: Copiá y pegá todo esto en el SQL Editor de Supabase
-- Funciona tanto si las tablas ya existen como si no.
-- ====================================================================

-- ─── TABLA 1: PERFILES DE USUARIO ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  user_type TEXT DEFAULT 'particular' CHECK (user_type IN ('particular', 'agencia', 'negocio_automotor')),
  phone_whatsapp TEXT,
  city TEXT,
  province TEXT,
  location_details TEXT,
  business_name TEXT,
  rubro TEXT,
  address TEXT,
  website_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  business_hours TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  plan_status TEXT DEFAULT NULL,
  current_plan TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columnas que pueden no existir si la tabla ya estaba creada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_details TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_hours TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT NULL;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname = 'Permitir lectura publica de perfiles') THEN
    CREATE POLICY "Permitir lectura publica de perfiles" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname = 'Permitir crear perfiles al registrarse') THEN
    CREATE POLICY "Permitir crear perfiles al registrarse" ON public.profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname = 'Permitir crear y editar perfil propio') THEN
    CREATE POLICY "Permitir crear y editar perfil propio" ON public.profiles FOR ALL USING (true);
  END IF;
END $$;

-- ─── TRIGGER: Crear perfil automáticamente al registrarse ──────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, phone_whatsapp, city, province, location_details, business_name, rubro)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'particular'),
    NEW.raw_user_meta_data->>'phone_whatsapp',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'province',
    NEW.raw_user_meta_data->>'location_details',
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'rubro'
  )
  ON CONFLICT (id) DO UPDATE SET
    user_type = EXCLUDED.user_type,
    full_name = EXCLUDED.full_name,
    business_name = EXCLUDED.business_name,
    rubro = EXCLUDED.rubro;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── VISTA: Métricas de usuarios por tipo ─────────────────────────────────
CREATE OR REPLACE VIEW public.user_type_counts AS
SELECT 
  user_type,
  COUNT(*) AS total_users,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS new_last_30_days
FROM public.profiles
GROUP BY user_type;

-- ─── TABLA 2: VEHÍCULOS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT,
  year INTEGER NOT NULL,
  mileage TEXT NOT NULL,
  mileage_num INTEGER DEFAULT 0,
  fuel TEXT NOT NULL DEFAULT 'Nafta',
  transmission TEXT NOT NULL DEFAULT 'Manual',
  price_currency TEXT DEFAULT 'USD',
  price NUMERIC NOT NULL,
  formatted_price TEXT,
  location TEXT NOT NULL,
  seller_type TEXT DEFAULT 'Particular Verificado',
  seller_name TEXT NOT NULL,
  seller_whatsapp TEXT NOT NULL,
  badge TEXT,
  badge_color TEXT,
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ─── TABLA 3: DIRECTORIO MUNDO AUTOMOTOR ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services_directory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rubro_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  rating NUMERIC DEFAULT 5.0,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services_directory ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_directory_user_id_key') THEN
    ALTER TABLE public.services_directory ADD CONSTRAINT services_directory_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- ─── TABLA 4: LEADS / CONTACTOS POR WHATSAPP ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_whatsapp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── TABLA 5: SOLICITUDES DE PAGO (para panel superadmin) ─────────────────
CREATE TABLE IF NOT EXISTS public.plan_payment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_name TEXT,
  user_type TEXT,
  plan_key TEXT,
  plan_label TEXT,
  plan_price INTEGER,
  payment_method TEXT DEFAULT 'efectivo_transferencia',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS PARA TODAS LAS TABLAS ────────────────────────────────────────────
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_payment_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname = 'Permitir lectura publica de vehículos activos') THEN
    CREATE POLICY "Permitir lectura publica de vehículos activos" ON public.vehicles FOR SELECT USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname = 'Permitir publicar vehículos de forma publica') THEN
    CREATE POLICY "Permitir publicar vehículos de forma publica" ON public.vehicles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='services_directory' AND policyname = 'Permitir lectura publica del directorio de servicios') THEN
    CREATE POLICY "Permitir lectura publica del directorio de servicios" ON public.services_directory FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='services_directory' AND policyname = 'Permitir registrar negocios de forma publica') THEN
    CREATE POLICY "Permitir registrar negocios de forma publica" ON public.services_directory FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leads' AND policyname = 'Permitir registrar leads por WhatsApp') THEN
    CREATE POLICY "Permitir registrar leads por WhatsApp" ON public.leads FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='plan_payment_requests' AND policyname = 'Users insert own payment requests') THEN
    CREATE POLICY "Users insert own payment requests" ON public.plan_payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='plan_payment_requests' AND policyname = 'Users view own payment requests') THEN
    CREATE POLICY "Users view own payment requests" ON public.plan_payment_requests FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── STORAGE BUCKET PARA FOTOS DE VEHÍCULOS ───────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura publica de imágenes de vehículos') THEN
    CREATE POLICY "Lectura publica de imágenes de vehículos" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Subida publica de imágenes de vehículos') THEN
    CREATE POLICY "Subida publica de imágenes de vehículos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-images');
  END IF;
END $$;
