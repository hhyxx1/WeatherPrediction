// 天气API配置示例文件
// 请复制此文件为 weatherApiConfig.js 并填入您的实际API密钥
window.WEATHER_CONFIG = {
  // Open Meteo API配置
  weatherApi: {
    baseUrl: 'https://archive-api.open-meteo.com/v1/archive',
    geoBaseUrl: 'https://api.open-meteo.com/v1/geocoding',
    key: '' // Open Meteo公共API不需要API密钥
  },
  // DeepSeek AI API配置
  aiApi: {
    baseUrl: 'https://api.deepseek.com/v1',
    key: 'your_deepseek_api_key_here' // 替换为您的DeepSeek API密钥
  }
};