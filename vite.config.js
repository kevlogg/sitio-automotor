import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Plugin para simular los endpoints serverless de Mercado Pago en entorno de desarrollo local Vite
function localMercadoPagoDevPlugin() {
  return {
    name: 'local-mercadopago-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        if (url.pathname === '/api/mp/create-preference' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const handler = (await import('./api/mp/create-preference.js')).default;
              const mockReq = { method: 'POST', body: parsed, headers: req.headers };
              const mockRes = {
                setHeader: (k, v) => res.setHeader(k, v),
                status: (code) => ({
                  json: (data) => {
                    res.statusCode = code;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  },
                  end: () => res.end(),
                }),
              };
              await handler(mockReq, mockRes);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (url.pathname === '/api/superadmin/mp/callback') {
          try {
            const query = Object.fromEntries(url.searchParams.entries());
            const handler = (await import('./api/superadmin/mp/callback.js')).default;
            const mockReq = { query, headers: req.headers };
            const mockRes = {
              redirect: (location) => {
                res.statusCode = 302;
                res.setHeader('Location', location);
                res.end();
              },
            };
            await handler(mockReq, mockRes);
          } catch (err) {
            res.statusCode = 500;
            res.end('Error en callback: ' + err.message);
          }
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localMercadoPagoDevPlugin()],
  build: {
    emptyOutDir: true,
  },
});
