export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path } = req.query;
  const apiUrl = `https://api.openweathermap.org/data/2.5/${path.join('/')}`;

  try {
    const params = new URLSearchParams(req.query);
    delete params.path;

    // 使用环境变量中的 API key
    const apiKey = process.env.VITE_OPENWEATHER_API_KEY;
    if (apiKey) {
      params.append('appid', apiKey);
    } else {
      console.error('❌ OpenWeather API Key 未设置');
      return res.status(500).json({ error: 'OpenWeather API Key 未配置' });
    }

    const fullUrl = `${apiUrl}?${params.toString()}`;
    console.log('🌤️ OpenWeather 代理请求:', fullUrl.replace(apiKey, '***'));

    const response = await fetch(fullUrl);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ OpenWeather 代理错误:', error);
    res.status(500).json({ error: error.message });
  }
}
