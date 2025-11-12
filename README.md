# 全球天气数据分析与预测系统

一个基于现代Web技术和人工智能的综合气象数据可视化与分析平台，提供实时天气监控、历年同天历史数据分析和AI驱动的预测功能。

## 核心功能

### 实时监控面板
- 通过Open Meteo API获取全球城市实时天气数据
- 显示温度、湿度、风速、空气质量等关键气象指标
- 支持多城市切换和数据实时更新
- 直观的天气状况可视化展示

### 深度分析与预测
- **历年同天数据分析**：获取并分析1-30年同一天的历史天气数据
- **气候变化趋势分析**：基于长期历史数据识别气候变化模式
- **AI预测分析**：基于DeepSeek AI技术提供智能天气趋势分析
- **多种预测模型**：支持线性回归、时间序列分析等多种预测方法
- **数据可视化**：使用ECharts生成交互式温度趋势图表和对比分析

### 系统特点
- **统一视觉风格**：三个主要页面采用一致的浅蓝色渐变背景设计
- **玻璃拟态UI**：现代化的玻璃拟态设计提供优雅的用户体验
- **响应式布局**：完全适配从手机到桌面的各种设备尺寸
- **极端天气预警**：智能识别并提醒潜在的极端天气事件
- **长期气候趋势**：通过历年同天数据提供气候变化洞察

## 技术栈

### 前端技术
- **HTML5** - 语义化页面结构
- **CSS3** - 样式与动画效果
- **JavaScript (ES6+)** - 交互逻辑与API集成
- **Tailwind CSS** - 快速样式开发
- **ECharts.js** - 数据可视化图表
- **Anime.js & p5.js** - 动画与粒子效果

### 后端与API
- **Node.js** - 轻量级服务器
- **Open Meteo API** - 提供全球历史天气数据和实时数据
  - 使用Archive API获取历年历史天气数据
  - 无需API密钥，免费使用
- **DeepSeek AI API** - 提供AI预测分析能力

## 快速开始

### 前提条件

- Node.js 14.x 或更高版本
- 一个有效的DeepSeek AI API密钥（可选，用于AI预测功能）

### 1. 克隆项目

```bash
git clone <repository-url>
cd WeatherPrediction
```

### 2. 配置API

1. 复制示例配置文件：

```bash
cp weatherApiConfig.example.js weatherApiConfig.js
```

2. 编辑配置文件（Open Meteo API无需密钥）：

```javascript
// weatherApiConfig.js 配置示例
window.WEATHER_CONFIG = {
  // Open Meteo API配置
  weatherApi: {
    baseUrl: 'https://archive-api.open-meteo.com/v1/archive',
    geoBaseUrl: 'https://api.open-meteo.com/v1/geocoding',
    key: '' // Open Meteo公共API不需要API密钥
  },
  // DeepSeek API配置
  aiApi: {
    baseUrl: 'https://api.deepseek.com/v1',
    key: 'your_deepseek_api_key_here' // 替换为您的DeepSeek API密钥
  }
};
```

### 3. 运行服务器

```bash
node server.js
```

服务器将在 **http://localhost:8000** 启动。

## 页面访问

- **实时监控**：http://localhost:8000/
- **深度分析**：http://localhost:8000/analysis.html
- **关于系统**：http://localhost:8000/about.html

## 系统配置说明

### 历史数据范围
- 系统使用Open Meteo的Archive API，支持获取1-30年同一天的历史天气数据
- 时间范围选择器可在1-30年之间调整，提供灵活的分析深度
- 系统会智能处理闰年2月29日的特殊情况

### 安全措施
- 实现了Content-Security-Policy头配置
- 配置了X-Content-Type-Options: nosniff
- 静态资源缓存控制优化
- API密钥本地存储，通过.gitignore确保不提交至版本控制系统

### 兼容性
系统兼容所有主流现代浏览器：
- Chrome 54+
- Firefox 52+
- Safari 10+
- Edge 79+
- 移动设备浏览器

## 开发注意事项

1. **API密钥安全**
   - Open Meteo API无需密钥，但DeepSeek AI API需要配置密钥
   - 确保AI API密钥仅在本地环境配置，不提交至GitHub等版本控制系统
   - 定期更新API密钥以确保服务正常运行

2. **数据使用说明**
   - 系统提供的历史天气数据和AI预测结果仅供参考
   - 实际应用中请结合官方气象信息进行决策
   - 历年同天数据分析可用于长期气候变化趋势研究

3. **服务器端口**
   - 默认服务器端口为8000，如需修改请编辑server.js中的PORT常量

4. **数据处理特点**
   - 系统会自动计算历年同一天的日期范围
   - 对于闰年2月29日，会智能调整为2月28日或3月1日
   - 包含完善的错误处理和模拟数据生成机制，确保系统稳定性

## 性能优化

- 静态资源设置合理的缓存控制头
- 图表数据按需加载，避免不必要的API调用
- 响应式设计针对不同设备进行了性能优化
- 批量数据请求优化，减少网络延迟影响

## 安全说明

- 项目包含.gitignore文件，确保API密钥等敏感信息不会被提交
- 请勿在代码仓库中直接提交包含真实API密钥的配置文件
- 开发过程中请使用环境变量或本地配置文件管理敏感信息

## 开发与贡献

1. 确保您已经安装了Node.js环境
2. 克隆仓库并安装依赖（如果有）
3. 配置开发环境（复制weatherApiConfig.example.js为weatherApiConfig.js）
4. 启动开发服务器
5. 提交代码前请确保所有功能正常工作

## 故障排除

- **端口占用错误**：如果8000端口已被占用，请修改server.js中的PORT常量为其他可用端口
- **API连接问题**：检查网络连接和API配置是否正确
- **数据加载失败**：尝试刷新页面或检查控制台错误信息

## 许可证

MIT License

---

© 2024 全球天气数据分析与预测系统 | 技术支持：Open Meteo API & DeepSeek AI