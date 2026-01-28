const express = require('express');
const axios = require('axios');
const router = express.Router();

// IP检测服务配置
const IP_SERVICES = [
  {
    name: 'ipapi',
    url: 'http://ip-api.com/json/',
    transform: (data) => ({
      address: data.query,
      country: data.country,
      region: data.regionName,
      city: data.city,
      isp: data.isp,
      isProxy: data.proxy || false,
      confidence: data.status === 'success' ? 0.9 : 0.1,
      timezone: data.timezone,
      lat: data.lat,
      lon: data.lon
    })
  },
  {
    name: 'ipinfo',
    url: 'https://ipinfo.io/',
    transform: (data) => ({
      address: data.ip,
      country: data.country,
      region: data.region,
      city: data.city,
      isp: data.org,
      isProxy: false, // ipinfo.io 免费版不提供代理检测
      confidence: 0.8,
      timezone: data.timezone,
      lat: data.loc ? parseFloat(data.loc.split(',')[0]) : null,
      lon: data.loc ? parseFloat(data.loc.split(',')[1]) : null
    })
  }
];

// 获取客户端真实IP
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

// 检测IP是否为内网地址
function isPrivateIP(ip) {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/
  ];
  
  return privateRanges.some(range => range.test(ip));
}

// 使用多个服务检测IP信息
async function detectIPWithFallback(ip) {
  const errors = [];
  
  for (const service of IP_SERVICES) {
    try {
      console.log(`尝试使用 ${service.name} 检测IP: ${ip}`);
      
      const url = service.url + (ip !== '127.0.0.1' ? ip : '');
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const result = service.transform(response.data);
      console.log(`${service.name} 检测成功:`, result);
      
      return {
        ...result,
        service: service.name,
        success: true
      };
      
    } catch (error) {
      console.error(`${service.name} 检测失败:`, error.message);
      errors.push({
        service: service.name,
        error: error.message
      });
    }
  }
  
  // 所有服务都失败，返回基本信息
  return {
    address: ip,
    country: '未知',
    region: '未知',
    city: '未知',
    isp: '未知',
    isProxy: false,
    confidence: 0.1,
    service: 'fallback',
    success: false,
    errors
  };
}

// 简单的代理检测
function detectProxy(req, ipInfo) {
  const proxyHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-proxy-id',
    'via',
    'forwarded'
  ];
  
  const hasProxyHeaders = proxyHeaders.some(header => req.headers[header]);
  
  return {
    isProxy: hasProxyHeaders || ipInfo.isProxy,
    proxyHeaders: hasProxyHeaders ? proxyHeaders.filter(h => req.headers[h]) : [],
    confidence: hasProxyHeaders ? 0.8 : (ipInfo.isProxy ? ipInfo.confidence : 0.1)
  };
}

// IP检测端点
router.get('/detect', async (req, res) => {
  try {
    const clientIP = getClientIP(req);
    const isPrivate = isPrivateIP(clientIP);
    
    console.log(`检测IP: ${clientIP}, 是否内网: ${isPrivate}`);
    
    // 如果是内网IP，使用外网IP检测服务
    const targetIP = isPrivate ? '' : clientIP;
    
    const ipInfo = await detectIPWithFallback(targetIP);
    const proxyInfo = detectProxy(req, ipInfo);
    
    const result = {
      ...ipInfo,
      originalIP: clientIP,
      isPrivateIP: isPrivate,
      proxyDetection: proxyInfo,
      detectedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('IP检测失败:', error);
    res.status(500).json({
      success: false,
      error: 'IP检测服务暂时不可用',
      details: error.message
    });
  }
});

// 测试特定IP的检测
router.post('/detect', async (req, res) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        error: '请提供要检测的IP地址'
      });
    }
    
    const ipInfo = await detectIPWithFallback(ip);
    
    res.json({
      success: true,
      data: {
        ...ipInfo,
        originalIP: ip,
        isPrivateIP: isPrivateIP(ip),
        detectedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('IP检测失败:', error);
    res.status(500).json({
      success: false,
      error: 'IP检测服务暂时不可用',
      details: error.message
    });
  }
});

module.exports = router;