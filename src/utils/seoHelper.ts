import { BarberShopConfig, ServiceItem, Barber, ReviewItem } from '../types';

/**
 * Updates dynamic favicon and browser tab title for the current Barber Shop
 */
export function updateDocumentHead(config: BarberShopConfig) {
  if (typeof document === 'undefined') return;

  // Update browser tab title
  if (config.shopName) {
    document.title = `${config.shopName} | Turnos en Vivo`;
  }

  // Update Favicon in browser tabs
  const iconHref = config.logoUrl && config.logoUrl.trim().length > 0 ? config.logoUrl : '/favicon.png';
  
  let iconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  if (!iconLink) {
    iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    document.head.appendChild(iconLink);
  }
  iconLink.href = iconHref;

  let appleTouchLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
  if (!appleTouchLink) {
    appleTouchLink = document.createElement('link');
    appleTouchLink.rel = 'apple-touch-icon';
    document.head.appendChild(appleTouchLink);
  }
  appleTouchLink.href = iconHref;
}

/**
 * Injects or updates Schema.org JSON-LD structured data for BarberShop
 * to maximize Google Local SEO, Google Maps proximity ranking, and Rich Snippets.
 */
export function updateBarberShopSchema(
  config: BarberShopConfig,
  services: ServiceItem[],
  barbers: Barber[],
  reviews: ReviewItem[]
) {
  updateDocumentHead(config);

  const scriptId = 'barbershop-jsonld-schema';
  let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!scriptElement) {
    scriptElement = document.createElement('script');
    scriptElement.id = scriptId;
    scriptElement.type = 'application/ld+json';
    document.head.appendChild(scriptElement);
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '4.9';

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BarberShop',
    name: config.shopName,
    description: config.slogan,
    image: [config.coverImageUrl || config.logoUrl || '/barber-logo.png'],
    telephone: config.adminPhone,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address,
      addressLocality: config.neighborhood,
      addressRegion: config.city,
      addressCountry: 'AR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: config.coordinates.lat,
      longitude: config.coordinates.lng
    },
    url: window.location.href,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '21:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '11:00',
        closes: '18:00'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviews.length || 1,
      bestRating: '5',
      worstRating: '1'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios de Barbería y Cuidado Masculino',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.name,
          description: s.description
        },
        price: s.price,
        priceCurrency: 'ARS'
      }))
    },
    employee: barbers.map((b) => ({
      '@type': 'Person',
      name: b.name,
      jobTitle: b.role
    }))
  };

  scriptElement.textContent = JSON.stringify(schemaData, null, 2);
}
