-- ============================================================
-- PASO 1: Agregá las columnas de plan a la tabla profiles
-- (la tabla profiles ya existe porque la app la usa con upsert)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT NULL;

-- ============================================================
-- PASO 2: Tabla de solicitudes de pago para el superadmin
-- Referencia a auth.users directamente (no a profiles)
-- ============================================================

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

-- ============================================================
-- PASO 3: Row Level Security
-- ============================================================

ALTER TABLE public.plan_payment_requests ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden crear sus propias solicitudes
CREATE POLICY "Users insert own payment requests"
  ON public.plan_payment_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden ver sus propias solicitudes
CREATE POLICY "Users view own payment requests"
  ON public.plan_payment_requests
  FOR SELECT
  USING (auth.uid() = user_id);
