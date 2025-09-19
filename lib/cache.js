// Simple in-memory cache for API responses
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum number of cached items
    this.ttl = 5 * 60 * 1000; // 5 minutes TTL
  }

  // Generate cache key from request parameters
  generateKey(method, url, body) {
    const bodyStr = body ? JSON.stringify(body) : "";
    return `${method}:${url}:${bodyStr}`;
  }

  // Get cached response
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache entry has expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Set cache entry
  set(key, data) {
    // Clean up old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Get cache size
  size() {
    return this.cache.size;
  }
}

// Export singleton instance
export const apiCache = new SimpleCache();

// Cached fetch function
export async function cachedFetch(url, options = {}) {
  const method = options.method || "GET";
  const cacheKey = apiCache.generateKey(method, url, options.body);

  // Try to get from cache first (only for GET requests)
  if (method === "GET") {
    const cachedResponse = apiCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  }

  // Make the actual request
  const response = await fetch(url, options);

  // Cache successful GET responses
  if (method === "GET" && response.ok) {
    const responseClone = response.clone();
    const data = await responseClone.json();
    apiCache.set(cacheKey, data);
    return data;
  }

  return response;
}
