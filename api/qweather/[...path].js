export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path } = req.query;

  // 使用环境变量，并提供默认值
  const apiHost = process.env.VITE_API_HOST || 'api.qweather.com';
  const apiUrl = `https://${apiHost}/${path.join('/')}`;

  try {
    const queryParams = { ...req.query };
    delete queryParams.path;

    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = queryString ? `${apiUrl}?${queryString}` : apiUrl;

    console.log('🌤️ 代理和风天气请求:', fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': req.headers.authorization || ''
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ 和风天气代理错误:', error);
    res.status(500).json({ error: error.message });
  }
}
