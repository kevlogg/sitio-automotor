/**
 * SEO & Structured Data (JSON-LD) Utility for Sitio Automotor
 * Manages dynamic document title, meta tags, Open Graph, Twitter Cards, Canonical URL,
 * and Google Schema.org JSON-LD microdata.
 */

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://sitioautomotor.com.ar';
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;
const DEFAULT_TITLE = 'Sitio Automotor | Marketplace Automotor Líder en Argentina';
const DEFAULT_DESCRIPTION = 'Comprá y vendé autos, camionetas, motos y náutica en Argentina. Publicaciones de concesionarias oficiales y particulares verificados con contacto directo por WhatsApp.';

function setMetaTag(attribute, value, content) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attribute}="${value}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || '');
}

function setCanonicalUrl(url) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setJsonLdSchema(id, schemaObject) {
  if (typeof document === 'undefined') return;
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaObject, null, 2);
}

/**
 * Updates full SEO metadata for a page or modal
 */
export function updateSeoMetadata({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = typeof window !== 'undefined' ? window.location.href : SITE_URL,
  type = 'website',
  schema = null
} = {}) {
  if (typeof document === 'undefined') return;

  // 1. Page Title
  document.title = title;

  // 2. Standard Meta Description
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // 3. Open Graph (Facebook, WhatsApp, LinkedIn)
  setMetaTag('property', 'og:site_name', 'Sitio Automotor');
  setMetaTag('property', 'og:locale', 'es_AR');
  setMetaTag('property', 'og:type', type);
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', image);
  setMetaTag('property', 'og:url', url);

  // 4. Twitter Cards
  setMetaTag('property', 'twitter:card', 'summary_large_image');
  setMetaTag('property', 'twitter:title', title);
  setMetaTag('property', 'twitter:description', description);
  setMetaTag('property', 'twitter:image', image);

  // 5. Canonical URL
  setCanonicalUrl(url);

  // 6. JSON-LD Schema
  if (schema) {
    setJsonLdSchema('seo-schema-custom', schema);
  } else {
    // Default Organization & WebSite SearchAction schema
    setJsonLdSchema('seo-schema-custom', {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          'url': SITE_URL,
          'name': 'Sitio Automotor',
          'description': DEFAULT_DESCRIPTION,
          'potentialAction': [
            {
              '@type': 'SearchAction',
              'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${SITE_URL}/vehiculos?buscar={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            }
          ],
          'inLanguage': 'es-AR'
        },
        {
          '@type': 'AutoDealer',
          '@id': `${SITE_URL}/#organization`,
          'name': 'Sitio Automotor Argentina',
          'url': SITE_URL,
          'logo': DEFAULT_IMAGE,
          'image': DEFAULT_IMAGE,
          'description': DEFAULT_DESCRIPTION,
          'address': {
            '@type': 'PostalAddress',
            'addressCountry': 'AR',
            'addressLocality': 'Argentina'
          },
          'priceRange': '$$$'
        }
      ]
    });
  }
}

/**
 * Builds Schema.org BreadcrumbList microdata
 */
export function buildBreadcrumbsSchema(items = []) {
  if (!items || items.length === 0) return null;
  return {
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
    }))
  };
}

/**
 * Builds Schema.org Vehicle data for a car publication
 */
export function buildVehicleSchema(vehicle) {
  if (!vehicle) return null;
  const canonicalUrl = `${SITE_URL}/vehiculos/${vehicle.id}`;

  const vehicleCarSchema = {
    '@type': 'Car',
    'name': vehicle.title || 'Vehículo en venta',
    'description': vehicle.description || `${vehicle.title} año ${vehicle.year || ''} con ${vehicle.mileage || ''} en venta en Sitio Automotor.`,
    'image': vehicle.image ? [vehicle.image] : [DEFAULT_IMAGE],
    'url': canonicalUrl,
    'vehicleModelDate': vehicle.year ? String(vehicle.year) : undefined,
    'brand': {
      '@type': 'Brand',
      'name': vehicle.brand || vehicle.title?.split(' ')[0] || 'Automotor'
    },
    'model': vehicle.title,
    'mileageFromOdometer': vehicle.mileage ? {
      '@type': 'QuantitativeValue',
      'value': String(vehicle.mileage).replace(/\D/g, ''),
      'unitCode': 'KMT'
    } : undefined,
    'offers': {
      '@type': 'Offer',
      'url': canonicalUrl,
      'priceCurrency': vehicle.currency || 'USD',
      'price': vehicle.price || 0,
      'itemCondition': vehicle.condition === 'Nuevo' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': vehicle.sellerType === 'agencia' ? 'AutoDealer' : 'Person',
        'name': vehicle.sellerName || 'Vendedor en Sitio Automotor'
      }
    }
  };

  const breadcrumbsSchema = buildBreadcrumbsSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Vehículos', url: '/vehiculos' },
    { name: vehicle.title, url: `/vehiculos/${vehicle.id}` }
  ]);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      vehicleCarSchema,
      breadcrumbsSchema
    ]
  };
}
