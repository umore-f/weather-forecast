// 天气数据缓存管理器
class WeatherCacheManager {
  constructor() {
    // 缓存配置
    this.CACHE_CONFIG = {
      WEATHER_NOW: { key: 'weather_now', ttl: 30 * 60 * 1000 }, // 30分钟
      WEATHER_HOURS: { key: 'weather_hours', ttl: 60 * 60 * 1000 }, // 1小时
      WEATHER_DAYS: { key: 'weather_days', ttl: 2 * 60 * 60 * 1000 } // 2小时
    };

    // 初始化时清理过期缓存
    this.clearExpiredCache();
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} data - 要缓存的数据
   * @param {number} ttl - 缓存有效期（毫秒）
   */
  setCache(key, data, ttl) {
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
      this.clearExpiredCache(); // 尝试清理后重试
      return false;
    }
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存数据或null
   */
  getCache(key) {
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
  clearExpiredCache() {
    Object.values(this.CACHE_CONFIG).forEach(config => {
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
  getCityCacheKey(baseKey, cityId) {
    return `${baseKey}_${cityId}`;
  }

  /**
   * 获取天气数据（带缓存）
   * @param {string} location - 城市名称
   * @param {Object} apiCallbacks - API调用函数对象
   * @param {Function} apiCallbacks.searchCity - 搜索城市函数
   * @param {Function} apiCallbacks.getWeatherNowInfo - 获取实时天气函数
   * @param {Function} apiCallbacks.getWeatherHoursInfo - 获取小时天气函数
   * @param {Function} apiCallbacks.getWeatherDaysInfo - 获取天天气函数
   * @returns {Promise<Object>} 天气数据对象
   */
  async getWeatherWithCache(location, apiCallbacks) {
    try {
      // 1. 获取城市ID - 每次都从API获取，不缓存（遵守和风天气规定）
      console.log('🔍 查询城市数据（实时）');
      const resCity = await apiCallbacks.searchCity(location);
      const cityId = +resCity.data.location[0].id;

      // 2. 获取天气数据 - 使用缓存
      const cacheKeys = {
        now: this.getCityCacheKey(this.CACHE_CONFIG.WEATHER_NOW.key, cityId),
        hours: this.getCityCacheKey(this.CACHE_CONFIG.WEATHER_HOURS.key, cityId),
        days: this.getCityCacheKey(this.CACHE_CONFIG.WEATHER_DAYS.key, cityId)
      };

      // 检查天气数据缓存
      const cachedNow = this.getCache(cacheKeys.now);
      const cachedHours = this.getCache(cacheKeys.hours);
      const cachedDays = this.getCache(cacheKeys.days);

      // 如果所有天气数据都有缓存，直接使用
      if (cachedNow && cachedHours && cachedDays) {
        console.log('📦 使用缓存的天气数据');
        return {
          cityId,
          now: cachedNow,
          hours: cachedHours,
          days: cachedDays,
          fromCache: true
        };
      }

      console.log('🌤️ 获取最新天气数据');

      // 3. 获取API数据（只获取缺失的数据）
      const promises = [];

      if (!cachedNow) {
        promises.push(apiCallbacks.getWeatherNowInfo(cityId));
      }
      if (!cachedHours) {
        promises.push(apiCallbacks.getWeatherHoursInfo(cityId));
      }
      if (!cachedDays) {
        promises.push(apiCallbacks.getWeatherDaysInfo(cityId));
      }

      const results = await Promise.all(promises);

      // 处理结果
      let resultIndex = 0;
      const weatherData = {
        cityId,
        now: cachedNow,
        hours: cachedHours,
        days: cachedDays,
        fromCache: false
      };

      if (!cachedNow) {
        const res = results[resultIndex++];
        if (res.data.code === '200') {
          weatherData.now = res.data.now;
          this.setCache(cacheKeys.now, res.data.now, this.CACHE_CONFIG.WEATHER_NOW.ttl);
        }
      }

      if (!cachedHours) {
        const res = results[resultIndex++];
        if (res.data.code === '200') {
          weatherData.hours = res.data.hourly;
          this.setCache(cacheKeys.hours, res.data.hourly, this.CACHE_CONFIG.WEATHER_HOURS.ttl);
        }
      }

      if (!cachedDays) {
        const res = results[resultIndex];
        if (res.data.code === '200') {
          weatherData.days = res.data.daily;
          this.setCache(cacheKeys.days, res.data.daily, this.CACHE_CONFIG.WEATHER_DAYS.ttl);
        }
      }

      return weatherData;

    } catch (error) {
      console.error('❌ 获取天气数据失败:', error);
      throw error;
    }
  }

  /**
   * 清除指定城市的天气缓存
   * @param {string|number} cityId - 城市ID
   */
  clearCityCache(cityId) {
    Object.values(this.CACHE_CONFIG).forEach(config => {
      const cacheKey = this.getCityCacheKey(config.key, cityId);
      localStorage.removeItem(cacheKey);
    });
    console.log(`🗑️ 城市 ${cityId} 的天气缓存已清除`);
  }

  /**
   * 清除所有天气缓存
   */
  clearAllWeatherCache() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('weather_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🗑️ 所有天气缓存已清除');
  }

  /**
   * 获取缓存状态统计
   * @returns {Object} 缓存状态对象
   */
  getCacheStatus() {
    const status = {};
    Object.values(this.CACHE_CONFIG).forEach(config => {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(config.key));
      status[config.key] = {
        count: keys.length,
        keys: keys.slice(0, 10) // 只显示前10个，避免数据过大
      };
    });
    return status;
  }
}

// 创建单例实例
export const weatherCacheManager = new WeatherCacheManager();

// 导出类用于测试或特殊用例
export { WeatherCacheManager };
