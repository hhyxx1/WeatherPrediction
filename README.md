# 全球天气数据分析与预测系统

一个基于现代Web技术和人工智能的综合气象数据可视化与分析平台，提供实时天气监控、历史数据分析和AI驱动的预测功能。

## 核心功能

### 实时监控面板
- 通过和风天气API获取全球城市实时天气数据
- 显示温度、湿度、风速、空气质量等关键气象指标
- 支持多城市切换和数据实时更新
- 直观的天气状况可视化展示

### 深度分析与预测
- **历史数据分析**：获取并分析最近10天的历史天气数据
- **AI预测分析**：基于DeepSeek AI技术提供智能天气趋势分析
- **多种预测模型**：支持线性回归、时间序列分析等多种预测方法
- **数据可视化**：使用ECharts生成交互式温度趋势图表和对比分析

### 系统特点
- **统一视觉风格**：三个主要页面采用一致的浅蓝色渐变背景设计
- **玻璃拟态UI**：现代化的玻璃拟态设计提供优雅的用户体验
- **响应式布局**：完全适配从手机到桌面的各种设备尺寸
- **极端天气预警**：智能识别并提醒潜在的极端天气事件

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
- **和风天气API** - 提供实时天气数据和历史数据
  - 使用"天气时光机"功能获取历史天气数据
- **DeepSeek AI API** - 提供AI预测分析能力

## 快速开始

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

2. 编辑配置文件，填入您的API密钥：

```javascript
// weatherApiConfig.js 配置示例
const WEATHER_API_CONFIG = {
    baseUrl: 'https://api.qweather.com/v7', // 和风天气API基础URL
    apiKey: 'your_weather_api_key_here'     // 替换为您的API密钥
};

const AI_API_CONFIG = {
    baseUrl: 'https://api.deepseek.com/v1', // DeepSeek AI API基础URL
    apiKey: 'your_ai_api_key_here'          // 替换为您的API密钥
};
```

### 3. 运行服务器

```bash
node server.js
```

服务器将在 **http://localhost:8092** 启动。

## 页面访问

- **实时监控**：http://localhost:8092/
- **深度分析**：http://localhost:8092/analysis.html
- **关于系统**：http://localhost:8092/about.html

## 系统配置说明

### 历史数据限制
- 系统使用和风天气的"天气时光机"API，最多可获取最近10天的历史天气数据（不包含今天）
- 时间范围选择器已限制为1-10天，与API限制保持一致

### 安全措施
- 实现了Content-Security-Policy头配置
- 配置了X-Content-Type-Options: nosniff
- 静态资源缓存控制优化
- API密钥本地存储，不提交至版本控制系统

### 兼容性
系统兼容所有主流现代浏览器：
- Chrome 54+
- Firefox 52+
- Safari 10+
- Edge 79+
- 移动设备浏览器

## 开发注意事项

1. **API密钥安全**
   - 确保API密钥仅在本地环境配置，不提交至GitHub等版本控制系统
   - 定期更新API密钥以确保服务正常运行

2. **数据使用说明**
   - 系统提供的历史天气数据和AI预测结果仅供参考
   - 实际应用中请结合官方气象信息进行决策

3. **服务器端口**
   - 默认服务器端口为8092，如需修改请编辑server.js中的PORT常量

## 性能优化

- 静态资源设置合理的缓存控制头
- 图表数据按需加载，避免不必要的API调用
- 响应式设计针对不同设备进行了性能优化

## 许可证

MIT License

---

© 2025 全球天气数据分析与预测系统 | 技术支持：和风天气 API