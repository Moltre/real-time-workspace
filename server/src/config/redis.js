'use strict';

/**
 * Thin Redis client wrapper.
 * Falls back gracefully when Redis is not available (dev without Docker).
 */

let redis = null;

try {
  const Redis = require('ioredis');
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
  });

  redis.on('connect', () => console.log('✅  Redis connected'));
  redis.on('error', (err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Redis unavailable (non-fatal in dev):', err.message);
    }
  });
} catch {
  console.warn('⚠️  ioredis not loaded – Redis disabled');
}

module.exports = redis;
