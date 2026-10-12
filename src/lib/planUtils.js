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
  BASE: 'base',
  PREMIUM: 'premium',
  SUPER_PREMIUM: 'super_premium',
  // Aliases de compatibilidad previa
  PARTICULAR: 'base',
  AGENCIA_BASE: 'premium',
  AGENCIA_PRO: 'super_premium',
  NEGOCIO_BASE: 'base',
  NEGOCIO_PRO: 'super_premium',
};

export const PLAN_INFO = {
  particular: {
    label: 'Plan Base',
    price: 55000,
    priceLabel: '$55.000 / mes',
    userType: 'particular',
    vehicleLimit: 1,
    features: ['1 aviso en la plataforma', 'Comercios y particulares', 'Consultas directo a WhatsApp'],
  },
  base: {
    label: 'Plan Base',
    price: 55000,
    priceLabel: '$55.000 / mes',
    userType: 'negocio_automotor',
    vehicleLimit: 1,
    target: 'Comercios relacionados con el automotor y agencias virtuales',
    features: [
      'Comercios relacionados con el automotor y agencias virtuales',
      '1 aviso en la plataforma',
    ],
  },
  premium: {
    label: 'Plan Premium',
    price: 110000,
    priceLabel: '$110.000 / mes',
    userType: 'agencia',
    vehicleLimit: 20,
    target: 'Agencias multimarca y grandes comercios del mundo automotor',
    features: [
      'Agencias multimarca y grandes comercios del mundo automotor',
      'Hasta 20 avisos en la plataforma',
    ],
  },
  super_premium: {
    label: 'Plan Súper Premium',
    price: 220000,
    priceLabel: '$220.000 / mes',
    userType: 'agencia',
    vehicleLimit: 50,
    target: 'Agencias oficiales y comercios Súper Premium',
    features: [
      'Agencias oficiales y comercios Súper Premium',
      'Hasta 50 avisos en la plataforma',
      'Banners de promoción en la página',
    ],
  },
  // Mappings retrocompatibles para registros previos
  agencia_base: {
    label: 'Plan Premium',
    price: 110000,
    priceLabel: '$110.000 / mes',
    userType: 'agencia',
    vehicleLimit: 20,
    target: 'Agencias multimarca y grandes comercios del mundo automotor',
    features: [
      'Agencias multimarca y grandes comercios del mundo automotor',
      'Hasta 20 avisos en la plataforma',
    ],
  },
  agencia_pro: {
    label: 'Plan Súper Premium',
    price: 220000,
    priceLabel: '$220.000 / mes',
    userType: 'agencia',
    vehicleLimit: 50,
    target: 'Agencias oficiales y comercios Súper Premium',
    features: [
      'Agencias oficiales y comercios Súper Premium',
      'Hasta 50 avisos en la plataforma',
      'Banners de promoción en la página',
    ],
  },
  negocio_base: {
    label: 'Plan Base',
    price: 55000,
    priceLabel: '$55.000 / mes',
    userType: 'negocio_automotor',
    vehicleLimit: 1,
    target: 'Comercios relacionados con el automotor y agencias virtuales',
    features: [
      'Comercios relacionados con el automotor y agencias virtuales',
      '1 aviso en la plataforma',
    ],
  },
  negocio_pro: {
    label: 'Plan Premium',
    price: 110000,
    priceLabel: '$110.000 / mes',
    userType: 'negocio_automotor',
    vehicleLimit: 20,
    features: [
      'Grandes comercios del mundo automotor',
      'Hasta 20 avisos en la plataforma',
    ],
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
