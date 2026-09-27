/**
 * planUtils.js — Lógica compartida para el sistema de planes/membresías
 *
 * Estados posibles de plan_status en profiles:
 *   null / undefined  → Sin plan (recién registrado)
 *   'pending'         → Pago declarado, pendiente de verificación por superadmin
 *   'active'          → Plan activo (aprobado por superadmin)
 *   'rejected'        → Solicitud rechazada (pago no confirmado)
 *   'cancelled'       → Plan cancelado
 */

import { supabase } from './supabase';

export const PLAN_STATUS = {
  NONE: null,
  PENDING: 'pending',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const PLAN_KEYS = {
  PARTICULAR: 'particular',
  AGENCIA_BASE: 'agencia_base',
  AGENCIA_PRO: 'agencia_pro',
  NEGOCIO_BASE: 'negocio_base',
  NEGOCIO_PRO: 'negocio_pro',
};

export const PLAN_INFO = {
  particular: {
    label: 'Particular Standard',
    price: 15000,
    priceLabel: '$15.000 / publicación',
    userType: 'particular',
  },
  agencia_base: {
    label: 'Agencia Base',
    price: 90000,
    priceLabel: '$90.000 / mes',
    userType: 'agencia',
  },
  agencia_pro: {
    label: 'Agencia Pro',
    price: 190000,
    priceLabel: '$190.000 / mes',
    userType: 'agencia',
  },
  negocio_base: {
    label: 'Negocio Base',
    price: 49000,
    priceLabel: '$49.000 / mes',
    userType: 'negocio_automotor',
  },
  negocio_pro: {
    label: 'Negocio Pro',
    price: 99000,
    priceLabel: '$99.000 / mes',
    userType: 'negocio_automotor',
  },
};

/**
 * Envía una solicitud de pago al panel superadmin (tabla plan_payment_requests)
 * y marca el perfil como 'pending'.
 */
export async function submitPaymentClaim({ userId, userEmail, userName, userType, planKey }) {
  const plan = PLAN_INFO[planKey];
  if (!plan) throw new Error('Plan inválido: ' + planKey);

  // 1. Insertar solicitud en plan_payment_requests
  const { error: insertError } = await supabase
    .from('plan_payment_requests')
    .insert({
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      user_type: userType,
      plan_key: planKey,
      plan_label: plan.label,
      plan_price: plan.price,
      payment_method: 'efectivo_transferencia',
      status: 'pending',
    });

  if (insertError) throw insertError;

  // 2. Actualizar estado del perfil → pending
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      plan_status: 'pending',
      current_plan: planKey,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) throw updateError;

  return { planKey, plan };
}
