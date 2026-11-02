// Vercel Serverless Function: Crea preferencia de Checkout con 3% Marketplace Fee
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      planKey = 'base', 
      planName = 'Plan Base', 
      price = 55000, 
      userId = 'guest', 
      userEmail = 'usuario@sitioautomotor.com.ar', 
      userName = 'Usuario',
      baseUrl = 'https://sitioautomotor.com.ar' 
    } = req.body || {};

    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fzqqzvurwggqwvhvspxc.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mr5gzrvkIj62Nf4zbCuqYg_Pn1hhp7z';

    // Consultar el seller_access_token desde site_settings en Supabase
    const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.config_mercadopago&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const settingsData = await supabaseRes.json();
    const configRow = Array.isArray(settingsData) && settingsData[0];
    let mpSettings = {};
    if (configRow?.value) {
      try {
        mpSettings = typeof configRow.value === 'string' ? JSON.parse(configRow.value) : configRow.value;
      } catch (e) {}
    }

    const sellerToken = mpSettings?.seller_access_token;
    if (!sellerToken) {
      return res.status(400).json({ 
        error: 'La cuenta oficial de Mercado Pago no ha sido conectada por el administrador.' 
      });
    }

    const priceNum = Math.max(1, Number(price));
    // Comisión oficial del 3% para la cuenta de desarrollador
    const fee = Number((priceNum * 0.03).toFixed(2));
    const marketplaceFee = Math.max(0.01, fee);

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
        email: userEmail,
        name: userName,
      },
      external_reference: `sub_${userId}_${planKey}_${Date.now()}`,
      back_urls: {
        success: `${baseUrl}/panel?mp_status=approved&plan=${encodeURIComponent(planKey)}`,
        failure: `${baseUrl}/planes?mp_status=failure`,
        pending: `${baseUrl}/panel?mp_status=pending&plan=${encodeURIComponent(planKey)}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'SITIO AUTOMOTOR',
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok || !mpData.init_point) {
      console.error('[MP create-preference] Error de Mercado Pago:', mpData);
      return res.status(mpRes.status || 400).json({ 
        error: mpData.message || 'Error al generar preferencia en Mercado Pago',
        details: mpData 
      });
    }

    return res.status(200).json({
      id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
      marketplaceFee,
    });
  } catch (err) {
    console.error('[MP create-preference] Error inesperado:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}
