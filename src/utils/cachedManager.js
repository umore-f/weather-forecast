const CACHE_CONFIG = {
  WEATHER_NOW: { key: 'weather_now', ttl: 10 * 60 * 1000 }, // 10分钟
  WEATHER_HOURS: { key: 'weather_hours', ttl: 30 * 60 * 1000 }, // 1小时
  WEATHER_DAYS: { key: 'weather_days', ttl: 2 * 60 * 60 * 1000 }, // 2小时
  AIR_QUALITY: { key: 'air_quality', ttl: 30 * 60 * 1000 }, // 30分钟
};
/**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} data - 要缓存的数据
   * @param {number} ttl - 缓存有效期（毫秒）
   */
function setCache(key, data, ttl) {
  try {
    const cacheData = {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
    return true;
  } catch (error) {
    console.warn('❌ 缓存设置失败:', error);
    clearExpiredCache(); // 尝试清理后重试
    return false;
  }
}

/**
 * 获取缓存
 * @param {string} key - 缓存键
 * @returns {any|null} 缓存数据或null
 */
function getCache(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheData = JSON.parse(cached);

    // 检查是否过期
    if (Date.now() > cacheData.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.warn('❌ 缓存读取失败:', error);
    return null;
  }
}

/**
 * 清理过期缓存
 */
function clearExpiredCache() {
  Object.values(CACHE_CONFIG).forEach(config => {
    const cached = localStorage.getItem(config.key);
    if (cached) {
      try {
        const cacheData = JSON.parse(cached);
        if (Date.now() > cacheData.expiry) {
          localStorage.removeItem(config.key);
        }
      } catch (error) {
        localStorage.removeItem(config.key);
        console.log(error);
      }
    }
  });
}

/**
 * 生成城市特定的缓存键
 * @param {string} baseKey - 基础键名
 * @param {string|number} cityId - 城市ID
 * @returns {string} 完整的缓存键
 */
function getCityCacheKey(baseKey, cityId) {
  return `${baseKey}_${cityId}`;
}

export {CACHE_CONFIG,setCache,getCache,clearExpiredCache,getCityCacheKey}
