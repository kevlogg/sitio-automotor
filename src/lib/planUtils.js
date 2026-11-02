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
  AGENCIA_BASE: 'premium',
  AGENCIA_PRO: 'super_premium',
  NEGOCIO_BASE: 'base',
  NEGOCIO_PRO: 'super_premium',
};

export const DEFAULT_PLAN_PRICES = {
  base: 55000,
  premium: 110000,
  super_premium: 220000,
  particular: 55000,
};

let cachedPrices = null;

/**
 * Formatea un número en formato de moneda ARS ($55.000)
 */
export function formatPrice(amount) {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  return `$${num.toLocaleString('es-AR')}`;
}

/**
 * Consulta los valores configurados de los planes desde Supabase (tabla site_settings)
 */
export async function fetchPlanPrices() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, value')
      .in('id', ['plan_prices', 'plan_price_base', 'plan_price_premium', 'plan_price_super_premium', 'plan_price_particular']);

    const prices = { ...DEFAULT_PLAN_PRICES };

    if (!error && data && data.length > 0) {
      const pricesObj = data.find(r => r.id === 'plan_prices');
      if (pricesObj?.value) {
        try {
          const parsed = JSON.parse(pricesObj.value);
          if (parsed.base) prices.base = Number(parsed.base);
          if (parsed.premium) prices.premium = Number(parsed.premium);
          if (parsed.super_premium) prices.super_premium = Number(parsed.super_premium);
          if (parsed.particular) prices.particular = Number(parsed.particular);
        } catch (e) {
          console.warn('Error al parsear plan_prices JSON:', e);
        }
      }

      data.forEach(r => {
        if (r.id === 'plan_price_base' && r.value) prices.base = Number(r.value);
        if (r.id === 'plan_price_premium' && r.value) prices.premium = Number(r.value);
        if (r.id === 'plan_price_super_premium' && r.value) prices.super_premium = Number(r.value);
        if (r.id === 'plan_price_particular' && r.value) prices.particular = Number(r.value);
      });
    }

    cachedPrices = prices;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sa_plan_prices', JSON.stringify(prices));
      } catch (e) {}
    }
    return prices;
  } catch (err) {
    console.warn('Error al consultar precios de planes en Supabase:', err);
    return getCachedPlanPrices();
  }
}

/**
 * Obtiene los precios actuales en caché (o localStorage / defaults) de manera síncrona
 */
export function getCachedPlanPrices() {
  if (cachedPrices) return cachedPrices;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('sa_plan_prices');
      if (saved) {
        cachedPrices = JSON.parse(saved);
        return cachedPrices;
      }
    } catch (e) {}
  }
  return { ...DEFAULT_PLAN_PRICES };
}

/**
 * Guarda los nuevos valores de los planes en Supabase site_settings y actualiza la caché
 */
export async function savePlanPrices(newPrices) {
  const base = Math.max(0, Math.round(Number(newPrices.base ?? DEFAULT_PLAN_PRICES.base)));
  const premium = Math.max(0, Math.round(Number(newPrices.premium ?? DEFAULT_PLAN_PRICES.premium)));
  const super_premium = Math.max(0, Math.round(Number(newPrices.super_premium ?? DEFAULT_PLAN_PRICES.super_premium)));
  const particular = Math.max(0, Math.round(Number(newPrices.particular ?? base)));

  const pricesToSave = { base, premium, super_premium, particular };
  const now = new Date().toISOString();

  const rows = [
    { id: 'plan_prices', value: JSON.stringify(pricesToSave), updated_at: now },
    { id: 'plan_price_base', value: String(base), updated_at: now },
    { id: 'plan_price_premium', value: String(premium), updated_at: now },
    { id: 'plan_price_super_premium', value: String(super_premium), updated_at: now },
    { id: 'plan_price_particular', value: String(particular), updated_at: now },
  ];

  const { error } = await supabase.from('site_settings').upsert(rows);
  if (error) {
    console.error('Error al guardar precios de planes en Supabase:', error);
    throw error;
  }

  cachedPrices = pricesToSave;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('sa_plan_prices', JSON.stringify(pricesToSave));
      window.dispatchEvent(new CustomEvent('sa_plan_prices_updated', { detail: pricesToSave }));
    } catch (e) {}
  }

  return pricesToSave;
}

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
  // Mappings retrocompatibles
  agencia_base: {
    label: 'Plan Premium',
    price: 110000,
    priceLabel: '$110.000 / mes',
    userType: 'agencia',
    vehicleLimit: 20,
    target: 'Agencias multimarca y grandes comercios del mundo automotor',
    features: ['Hasta 20 avisos en la plataforma'],
  },
  agencia_pro: {
    label: 'Plan Súper Premium',
    price: 220000,
    priceLabel: '$220.000 / mes',
    userType: 'agencia',
    vehicleLimit: 50,
    target: 'Agencias oficiales y comercios Súper Premium',
    features: ['Hasta 50 avisos en la plataforma'],
  },
  negocio_base: {
    label: 'Plan Base',
    price: 55000,
    priceLabel: '$55.000 / mes',
    userType: 'negocio_automotor',
    vehicleLimit: 1,
    target: 'Comercios relacionados con el automotor y agencias virtuales',
    features: ['1 aviso en la plataforma'],
  },
  negocio_pro: {
    label: 'Plan Premium',
    price: 110000,
    priceLabel: '$110.000 / mes',
    userType: 'negocio_automotor',
    vehicleLimit: 20,
    features: ['Hasta 20 avisos en la plataforma'],
  },
};

/**
 * Obtiene la información de un plan con su precio dinámico actual
 */
export function getPlanInfo(planKey, prices = getCachedPlanPrices()) {
  const pKey = (planKey || 'base').toLowerCase();
  const rawInfo = PLAN_INFO[pKey] || PLAN_INFO.base;

  let currentPrice = prices.base;
  if (pKey.includes('super')) {
    currentPrice = prices.super_premium;
  } else if (pKey.includes('premium')) {
    currentPrice = prices.premium;
  } else if (pKey === 'particular') {
    currentPrice = prices.particular || prices.base;
  } else {
    currentPrice = prices.base;
  }

  return {
    ...rawInfo,
    price: currentPrice,
    priceLabel: `${formatPrice(currentPrice)} / mes`,
  };
}

export const BANKING_INFO = {
  bank: 'Banco Santander Río',
  accountType: 'Cuenta Corriente Especial en Pesos',
  accountHolder: 'Sitio Automotor S.A.',
  cuit: '30-71829384-9',
  cbu: '0720023420000001234567',
  alias: 'SITIO.AUTOMOTOR.ARG',
  whatsappAdmin: '5491152638000',
  whatsappAdminDisplay: '+54 (11) 5263-8000',
};

/**
 * Envía una solicitud de pago al panel superadmin (tabla plan_payment_requests)
 * y marca el perfil como 'pending'.
 */
export async function submitPaymentClaim({ userId, userEmail, userName, userType, planKey, referenceNumber = '', paymentMethod = 'efectivo_transferencia' }) {
  const prices = getCachedPlanPrices();
  const plan = getPlanInfo(planKey, prices);

  // 1. Insertar solicitud en plan_payment_requests
  try {
    await supabase
      .from('plan_payment_requests')
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        user_type: userType,
        plan_key: planKey,
        plan_label: plan.label,
        plan_price: plan.price,
        payment_method: paymentMethod,
        status: paymentMethod === 'mercadopago_auto' ? 'approved' : 'pending',
        notes: referenceNumber ? `Referencia / Operación: ${referenceNumber}` : (paymentMethod === 'mercadopago_auto' ? 'Abonado vía Checkout Mercado Pago' : null),
      });
  } catch (insertErr) {
    console.warn('Aviso al insertar en plan_payment_requests:', insertErr);
  }

  // 2. Actualizar estado del perfil
  try {
    await supabase
      .from('profiles')
      .update({
        plan_status: paymentMethod === 'mercadopago_auto' ? 'active' : 'pending',
        current_plan: planKey,
        payment_reference: referenceNumber || (paymentMethod === 'mercadopago_auto' ? 'MP_CHECKOUT' : null),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch (updateErr) {
    console.warn('Aviso al actualizar profiles:', updateErr);
  }

  return { planKey, plan, referenceNumber };
}
