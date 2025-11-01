// api/proxy/[...path].js
const { createProxyMiddleware } = require('http-proxy-middleware');

// API 配置
const API_CONFIG = {
  qweather: {
    target: 'https://api.qweather.com'
  },
  openweather: {
    target: 'https://api.openweathermap.org'
  }
};

module.exports = (req, res) => {
  // 解析请求路径，例如：/api/proxy/qweather/geo/v2/city/lookup
  const pathParts = req.query.path || [];
  const apiType = pathParts[0]; // 这里会是 'qweather' 或 'openweather'

  // 设置 CORS 头 - 解决跨域问题
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 检查是否支持该 API 类型
  if (!API_CONFIG[apiType]) {
    return res.status(400).json({ error: `不支持的 API 类型: ${apiType}` });
  }

  const targetConfig = API_CONFIG[apiType];

  // 创建代理中间件
  const proxyMiddleware = createProxyMiddleware({
    target: targetConfig.target,
    changeOrigin: true, // 修改请求头中的 Origin
    pathRewrite: {
      // 重写路径，移除代理前缀
      // 例如：/api/proxy/qweather/geo/v2/city/lookup → /geo/v2/city/lookup
      [`^/api/proxy/${apiType}`]: '',
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🌤️ 代理请求: ${req.method} ${req.url} → ${targetConfig.target}`);

      // 为和风天气传递认证头
      if (apiType === 'qweather' && req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }

      // 为 OpenWeather 添加 API Key
      if (apiType === 'openweather') {
        // 获取当前 URL 并添加 API Key
        const currentUrl = new URL(proxyReq.path, targetConfig.target);
        currentUrl.searchParams.set('appid', process.env.VITE_OPENWEATHER_API_KEY || '');
        proxyReq.path = currentUrl.pathname + currentUrl.search;
      }
    },
    onError: (err, req, res) => {
      console.error('❌ 代理错误:', err);
      res.status(500).json({ error: '代理服务器错误', details: err.message });
    }
  });

  // 执行代理
  proxyMiddleware(req, res);
};
