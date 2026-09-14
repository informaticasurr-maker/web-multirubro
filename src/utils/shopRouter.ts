/**
 * Shop routing utility to detect and format shop identifiers (slugs) from URLs
 */

export const DEFAULT_SHOP_SLUG = 'elias';

/**
 * Sanitize a string into a URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
};

/**
 * Detect current shop slug from URL path, query param, or hash
 */
export const getCurrentShopSlug = (): string => {
  try {
    // 1. Check URL query parameters (e.g., ?shop=vikingos or ?b=vikingos)
    const urlParams = new URLSearchParams(window.location.search);
    const querySlug = urlParams.get('shop') || urlParams.get('b') || urlParams.get('store');
    if (querySlug && querySlug.trim()) {
      return slugify(querySlug);
    }

    // 2. Check URL Hash (e.g., #/vikingos or #shop=vikingos)
    const hash = window.location.hash;
    if (hash) {
      if (hash.startsWith('#/shop/')) {
        const hashSlug = hash.replace('#/shop/', '').split('?')[0].split('/')[0];
        if (hashSlug) return slugify(hashSlug);
      } else if (hash.startsWith('#/') && !hash.startsWith('#/admin')) {
        const cleanHash = hash.replace('#/', '').split('?')[0].split('/')[0];
        if (cleanHash && cleanHash !== 'admin' && cleanHash !== 'turnos') {
          return slugify(cleanHash);
        }
      }
    }

    // 3. Check pathname (e.g., /vikingos or /vikingos/admin)
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (pathname) {
      const parts = pathname.split('/');
      const firstPart = parts[0];
      // Exclude system paths
      const systemPaths = ['admin', 'assets', 'api', 'login', 'dist', 'index.html'];
      if (firstPart && !systemPaths.includes(firstPart.toLowerCase())) {
        return slugify(firstPart);
      }
    }
  } catch (e) {
    console.warn('Error detecting shop slug from URL:', e);
  }

  // Fallback to default primary shop
  return DEFAULT_SHOP_SLUG;
};

/**
 * Generate full public shareable URL for a given shop slug
 */
export const getShopShareUrl = (slug: string): string => {
  const cleanSlug = slugify(slug || DEFAULT_SHOP_SLUG);
  const origin = window.location.origin;

  if (cleanSlug === DEFAULT_SHOP_SLUG) {
    return `${origin}/`;
  }

  return `${origin}/${cleanSlug}`;
};

/**
 * Navigate to a specific shop in SPA without losing state
 */
export const navigateToShop = (slug: string, isAdminRoute = false) => {
  const cleanSlug = slugify(slug || DEFAULT_SHOP_SLUG);
  const targetPath = cleanSlug === DEFAULT_SHOP_SLUG 
    ? (isAdminRoute ? '/admin' : '/')
    : (isAdminRoute ? `/${cleanSlug}/admin` : `/${cleanSlug}`);

  window.history.pushState(null, '', targetPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
