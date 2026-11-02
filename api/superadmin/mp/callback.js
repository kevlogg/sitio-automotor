// Vercel Serverless Function: Maneja el retorno OAuth de Mercado Pago y guarda las credenciales en Supabase
export default async function handler(req, res) {
  const { code, error } = req.query || {};

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'sitioautomotor.com.ar';
  const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;
  const superAdminUrl = `${baseUrl}/superadmin?tab=pagos`;

  if (error || !code) {
    console.warn('[MercadoPago OAuth] Error o código faltante:', error);
    return res.redirect(`${superAdminUrl}&mp_error=${encodeURIComponent(error || 'missing_code')}`);
  }

  try {
    const canonicalUri = 'https://sitioautomotor.com.ar/api/superadmin/mp/callback';
    const redirectUri = host.includes('localhost')
      ? `${baseUrl}/api/superadmin/mp/callback`
      : canonicalUri;

    console.log('[MercadoPago OAuth] Intercambiando código con redirectUri:', redirectUri);

    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: '5679645126166390',
        client_secret: '6aLpgSVKIoX6DUfihemWduf6Mi9trINV',
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[MercadoPago OAuth] Error en intercambio de tokens:', tokenData);
      return res.redirect(`${superAdminUrl}&mp_error=${encodeURIComponent(tokenData.message || tokenData.error || 'token_exchange_failed')}`);
    }

    // Guardar tokens en Supabase site_settings
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fzqqzvurwggqwvhvspxc.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mr5gzrvkIj62Nf4zbCuqYg_Pn1hhp7z';

    const updatedSettings = {
      connected: true,
      seller_id: tokenData.user_id || null,
      seller_access_token: tokenData.access_token,
      seller_public_key: tokenData.public_key || null,
      refresh_token: tokenData.refresh_token || null,
      token_type: tokenData.token_type || 'bearer',
      expires_in: tokenData.expires_in || null,
      scope: tokenData.scope || null,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await fetch(`${supabaseUrl}/rest/v1/site_settings`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: 'config_mercadopago',
        value: JSON.stringify(updatedSettings),
        updated_at: new Date().toISOString(),
      }),
    });

    console.log('[MercadoPago OAuth] Cuenta vinculada con éxito. ID:', tokenData.user_id);
    return res.redirect(`${superAdminUrl}&mp_connected=true`);
  } catch (err) {
    console.error('[MercadoPago OAuth] Excepción en callback:', err);
    return res.redirect(`${superAdminUrl}&mp_error=${encodeURIComponent(err.message || 'server_error')}`);
  }
}
