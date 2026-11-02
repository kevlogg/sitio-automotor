import { supabase } from './supabase';

export const MP_MARKETPLACE_CONFIG = {
  clientId: '5679645126166390',
  clientSecret: '6aLpgSVKIoX6DUfihemWduf6Mi9trINV',
  platformFeePercentage: 0.03, // 3% comisión oficial de plataforma para el desarrollador
};

export const DEFAULT_MP_SETTINGS = {
  connected: false,
  seller_id: null,
  seller_access_token: null,
  seller_public_key: null,
  refresh_token: null,
  token_type: null,
  expires_in: null,
  scope: null,
  connected_at: null,
  updated_at: null,
};

/**
 * Consulta la configuración de Mercado Pago desde la tabla site_settings de Supabase
 */
export async function getMercadoPagoSettings() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, value')
      .eq('id', 'config_mercadopago')
      .maybeSingle();

    if (error || !data || !data.value) {
      return { ...DEFAULT_MP_SETTINGS };
    }

    const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    return {
      ...DEFAULT_MP_SETTINGS,
      ...parsed,
      connected: Boolean(parsed.connected && parsed.seller_access_token),
    };
  } catch (err) {
    console.warn('[MercadoPago] Error al consultar configuración en Supabase:', err);
    return { ...DEFAULT_MP_SETTINGS };
  }
}

/**
 * Guarda o actualiza los datos de la cuenta de Mercado Pago conectada en site_settings
 */
export async function saveMercadoPagoSettings(settings) {
  try {
    const current = await getMercadoPagoSettings();
    const updated = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 'config_mercadopago',
        value: JSON.stringify(updated),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[MercadoPago] Error guardando configuración en Supabase:', error);
      return false;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sa_mp_settings_updated', { detail: updated }));
    }

    return true;
  } catch (err) {
    console.error('[MercadoPago] Error al guardar configuración:', err);
    return false;
  }
}

/**
 * Desconecta la cuenta de Mercado Pago actual
 */
export async function disconnectMercadoPago() {
  return saveMercadoPagoSettings({
    connected: false,
    seller_access_token: null,
    seller_public_key: null,
    refresh_token: null,
    seller_id: null,
    connected_at: null,
  });
}

/**
 * Genera la URL de autorización OAuth para que el cliente conecte su cuenta
 */
export function getOAuthAuthorizationUrl(redirectUri) {
  const clientId = MP_MARKETPLACE_CONFIG.clientId;
  const targetUri = redirectUri || 'https://sitioautomotor.com.ar/api/superadmin/mp/callback';
  return `https://auth.mercadopago.com/authorization?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(targetUri)}`;
}

/**
 * Conexión manual con Access Token del vendedor (valida directo contra la API de Mercado Pago)
 */
export async function connectMercadoPagoManual(accessToken) {
  try {
    const cleanToken = (accessToken || '').trim();
    if (!cleanToken.startsWith('APP_USR-') && !cleanToken.startsWith('TEST-')) {
      return { success: false, message: 'El Access Token debe comenzar con APP_USR- (o TEST-).' };
    }

    const res = await fetch('https://api.mercadopago.com/users/me', {
      headers: { Authorization: `Bearer ${cleanToken}` },
    });
    const userData = await res.json();
    if (!res.ok || !userData.id) {
      return { success: false, message: 'El Access Token ingresado no es válido o está revocado en Mercado Pago.' };
    }

    const ok = await saveMercadoPagoSettings({
      connected: true,
      seller_id: userData.id,
      seller_access_token: cleanToken,
      seller_public_key: null,
      connected_at: new Date().toISOString(),
    });

    if (ok) {
      return {
        success: true,
        sellerId: userData.id,
        nickname: userData.nickname || userData.first_name || '',
        message: `¡Cuenta oficial de Mercado Pago conectada exitosamente! (ID de Vendedor: ${userData.id})`,
      };
    }
    return { success: false, message: 'No se pudo guardar la configuración en la base de datos.' };
  } catch (err) {
    return { success: false, message: err.message || 'Error al conectar con la API de Mercado Pago.' };
  }
}

/**
 * Crea una preferencia de pago para la suscripción a un plan aplicando el 3% de Marketplace Fee
 */
export async function createPlanSubscriptionPreference({
  planKey,
  planName,
  price,
  userId,
  userEmail,
  userName = 'Usuario',
  baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sitioautomotor.com.ar',
}) {
  const settings = await getMercadoPagoSettings();

  if (!settings.connected || !settings.seller_access_token) {
    throw new Error('La cuenta de Mercado Pago del sitio aún no ha sido conectada por el administrador.');
  }

  const priceNum = Math.max(1, Number(price));
  // Comisión oficial del 3% para la cuenta del desarrollador (precisión a 2 decimales)
  const calculatedFee = Number((priceNum * MP_MARKETPLACE_CONFIG.platformFeePercentage).toFixed(2));
  const marketplaceFee = Math.max(0.01, calculatedFee);

  // Intentar crear mediante API route (para evitar problemas de CORS y proteger headers)
  try {
    const apiRes = await fetch('/api/mp/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planKey,
        planName,
        price: priceNum,
        marketplaceFee,
        userId,
        userEmail,
        userName,
        baseUrl,
      }),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.init_point) {
        return { id: data.id, init_point: data.init_point };
      }
    }
  } catch (apiErr) {
    console.warn('[MercadoPago] API endpoint no respondió, intentando llamada directa:', apiErr);
  }

  // Fallback directo a la API de Mercado Pago con el token del vendedor
  const preferencePayload = {
    items: [
      {
        id: `plan-${planKey}`,
        title: `Suscripción Sitio Automotor - ${planName}`,
        description: `Abono mensual ${planName} para ${userName}`,
        quantity: 1,
        currency_id: 'ARS',
        unit_price: priceNum,
      },
    ],
    marketplace_fee: marketplaceFee,
    payer: {
      email: userEmail || 'usuario@sitioautomotor.com.ar',
      name: userName,
    },
    external_reference: `sub_${userId || 'guest'}_${planKey}_${Date.now()}`,
    back_urls: {
      success: `${baseUrl}/panel?mp_status=approved&plan=${encodeURIComponent(planKey)}`,
      failure: `${baseUrl}/planes?mp_status=failure`,
      pending: `${baseUrl}/panel?mp_status=pending&plan=${encodeURIComponent(planKey)}`,
    },
    auto_return: 'approved',
    statement_descriptor: 'SITIO AUTOMOTOR',
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.seller_access_token}`,
    },
    body: JSON.stringify(preferencePayload),
  });

  const data = await res.json();
  if (!res.ok || !data.init_point) {
    throw new Error(data.message || 'No se pudo generar el checkout de Mercado Pago.');
  }

  return {
    id: data.id,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  };
}

/**
 * Crea una preferencia de pago de prueba ($10 ARS) para verificar la comisión del 3% y el split
 */
export async function createTestPaymentPreference(userEmail, baseUrl) {
  return createPlanSubscriptionPreference({
    planKey: 'test',
    planName: 'Plan de Prueba ($10 ARS)',
    price: 10,
    userId: 'superadmin_test',
    userEmail: userEmail || 'admin@sitioautomotor.com.ar',
    userName: 'Administrador de Prueba',
    baseUrl: baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://sitioautomotor.com.ar'),
  });
}
