-- ====================================================================
-- ESQUEMA Y CONFIGURACIÓN COMPLETA DE SUPABASE (TABLAS + STORAGE + RLS)
-- Proyecto: Sitio Automotor
-- Ejecutar este script completo en el SQL Editor de Supabase
-- ====================================================================

-- 0. TABLA DE PERFILES DE USUARIO (Particular / Agencia / Negocio Automotor)
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar columnas avanzadas de perfil si la tabla ya existía
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_details TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_hours TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir lectura publica de perfiles') THEN
    CREATE POLICY "Permitir lectura publica de perfiles" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir crear perfiles al registrarse') THEN
    CREATE POLICY "Permitir crear perfiles al registrarse" ON public.profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir crear y editar perfil propio') THEN
    CREATE POLICY "Permitir crear y editar perfil propio" ON public.profiles FOR ALL USING (true);
  END IF;
END $$;

-- TRIGGER AUTOMÁTICO EN SUPABASE POSTGRES (Garantiza el guardado de user_type e info al registrarse)
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

-- 0.1 VISTA Y MÉTRICAS DE TIPOS DE USUARIOS (Mide cantidad de usuarios por cada tipo)
CREATE OR REPLACE VIEW public.user_type_counts AS
SELECT 
  user_type,
  COUNT(*) AS total_users,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS new_last_30_days
FROM public.profiles
GROUP BY user_type;


-- 1. TABLA DE VEHÍCULOS
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'autos', 'camionetas', 'motos', 'camiones', 'nautica', 'agro'
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
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'sold'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DEL DIRECTORIO "MUNDO AUTOMOTOR" (Servicios y Rubros)
CREATE TABLE IF NOT EXISTS public.services_directory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rubro_id TEXT NOT NULL, -- 'repuestos', 'talleres', 'lubricentros', 'gomerias', etc.
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

-- 3. TABLA DE LEADS / CONTACTOS POR WHATSAPP (Métricas)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  seller_whatsapp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POLÍTICAS DE SEGURIDAD EN TABLAS (RLS)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir lectura publica de vehículos activos') THEN
    CREATE POLICY "Permitir lectura publica de vehículos activos" ON public.vehicles FOR SELECT USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir lectura publica del directorio de servicios') THEN
    CREATE POLICY "Permitir lectura publica del directorio de servicios" ON public.services_directory FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir publicar vehículos de forma publica') THEN
    CREATE POLICY "Permitir publicar vehículos de forma publica" ON public.vehicles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir registrar leads por WhatsApp') THEN
    CREATE POLICY "Permitir registrar leads por WhatsApp" ON public.leads FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 5. CREACIÓN DEL BUCKET DE SUPABASE STORAGE (FOTOS HD)
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
