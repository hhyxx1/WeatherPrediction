// 天气系统核心模块 - 使用命名空间模式避免变量冲突
// 包含完整的天气数据获取和显示功能

// 创建全局命名空间
window.WeatherApp = window.WeatherApp || {};

// 初始化应用
(function() {
    // 配置对象
    window.WeatherApp.config = {
        currentChartType: 'temperature',
        currentTimeRange: '24h',
        weatherData: {},
        chartInstances: {},
        currentCity: { id: '101010100', name: '北京' },
        popularCities: [
            { id: '101010100', name: '北京' },
            { id: '101020100', name: '上海' },
            { id: '101280101', name: '广州' },
            { id: '101280601', name: '深圳' },
            { id: '101210101', name: '杭州' },
            { id: '101110101', name: '西安' },
            { id: '101280201', name: '成都' },
            { id: '101280401', name: '天津' }
        ]
    };
    
    // 天气图标映射
    window.WeatherApp.weatherIcons = {
        '100': '☀️',
        '101': '⛅',
        '102': '☁️',
        '103': '☁️',
        '104': '☁️',
        '200': '🌫️',
        '201': '🌬️',
        '202': '💨',
        '203': '💨',
        '204': '💨',
        '205': '💨',
        '206': '💨',
        '300': '🌦️',
        '301': '🌧️',
        '302': '⛈️',
        '310': '🌦️',
        '311': '🌧️',
        '312': '⛈️',
        '313': '🌧️',
        '314': '⛈️',
        '400': '🌨️',
        '401': '❄️',
        '402': '❄️',
        '403': '❄️',
        '404': '🌨️',
        '405': '❄️',
        '500': '🌫️',
        '501': '🌫️',
        '502': '🌫️',
        '503': '🌫️',
        '504': '🌫️',
        '507': '🌫️',
        '508': '🌫️',
        '900': '🌡️',
        '901': '🌡️',
        '999': '🌫️'
    };
    
    // 显示通知
    window.WeatherApp.showNotification = function(message, type = 'info') {
        console.log(`[${type}] ${message}`);
        // 可以添加实际的通知UI实现
    };

    // 通过经纬度获取城市信息 - 使用和风天气地理编码API
    window.WeatherApp.getCityByLocation = async function(latitude, longitude) {
        try {
            const config = window.WEATHER_CONFIG.weatherApi;
            const url = `${config.geoBaseUrl}/city/lookup?location=${longitude},${latitude}&key=${config.key}`;
            
            console.log(`尝试通过经纬度(${latitude}, ${longitude})获取城市信息`);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code === '200' && data.location && data.location.length > 0) {
                return { 
                    id: data.location[0].id, 
                    name: data.location[0].name 
                };
            } else {
                throw new Error('未找到对应的城市信息');
            }
        } catch (error) {
            console.error('通过位置获取城市信息失败:', error);
            throw error;
        }
    };

    // 获取用户当前位置
    window.WeatherApp.getUserLocation = function() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('浏览器不支持地理定位'));
                return;
            }
            
            this.showNotification('正在获取您的位置...', 'info');
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const city = await this.getCityByLocation(latitude, longitude);
                        resolve({ id: city.id, name: city.name });
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    let errorMsg = '获取位置失败';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = '您拒绝了位置请求';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = '位置信息不可用';
                            break;
                        case error.TIMEOUT:
                            errorMsg = '获取位置超时';
                            break;
                    }
                    reject(new Error(errorMsg));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    // 初始化函数
    window.WeatherApp.init = function() {
        console.log('天气应用初始化中...');
        
        // 检查当前页面是否为about.html
        const isAboutPage = window.location.pathname.includes('about.html');
        
        if (isAboutPage) {
            console.log('当前为关于页面，跳过位置获取和天气数据加载');
            // 在about页面只显示模态框功能，不执行其他初始化
            return;
        }
        
        // 初始化热门城市列表
        this.initPopularCities();
        
        // 尝试获取用户位置
        this.getUserLocation()
            .then(city => {
                console.log(`成功获取位置: ${city.name}`);
                this.selectCity(city.id, city.name);
            })
            .catch(async error => {
                console.warn(`获取位置失败，使用默认城市: ${error.message}`);
                // 默认加载北京的天气数据
                await this.loadCityWeather(this.config.currentCity.id, this.config.currentCity.name);
            })
            .finally(() => {
                // 初始化图表
                this.initCharts();
                console.log('天气应用初始化完成');
            });
    };
    
    // 初始化热门城市列表
    window.WeatherApp.initPopularCities = function() {
        const container = document.getElementById('popularCities');
        if (!container) return;
        
        container.innerHTML = '';
        this.config.popularCities.forEach(city => {
            // 创建卡片，初始显示"--"表示正在加载
            const card = document.createElement('div');
            card.className = 'weather-card rounded-xl p-4 cursor-pointer glass-effect';
            card.innerHTML = `
                <h4 class="font-semibold text-slate-800">${city.name}</h4>
                <div class="weather-icon text-2xl">🌤️</div>
                <p class="temperature-display text-xl">--°C</p>
                <p class="text-sm text-slate-600">--</p>
            `;
            card.onclick = () => this.selectCity(city.id, city.name);
            container.appendChild(card);
            
            // 异步获取城市天气信息
            this.fetchCityWeatherForCard(city.id, card);
        });
    };
    
    // 为热门城市卡片获取天气数据
    window.WeatherApp.fetchCityWeatherForCard = async function(cityId, cardElement) {
        try {
            const config = window.WEATHER_CONFIG.weatherApi;
            const url = `${config.baseUrl}/weather/now?location=${cityId}&key=${config.key}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code === '200' && data.now) {
                // 更新卡片内容
                const weatherIcon = this.weatherIcons[data.now.icon] || '🌤️';
                const temperature = data.now.temp || '--';
                const weatherText = data.now.text || '--';
                
                cardElement.querySelector('.weather-icon').textContent = weatherIcon;
                cardElement.querySelector('.temperature-display').textContent = `${temperature}°C`;
                cardElement.querySelector('.text-sm').textContent = weatherText;
            }
        } catch (error) {
            console.error(`获取城市ID ${cityId} 的天气数据失败:`, error);
            // 保持"--"显示
        }
    };
    
    // 选择城市
    window.WeatherApp.selectCity = async function(cityId, cityName) {
        this.config.currentCity = { id: cityId, name: cityName };
        await this.loadCityWeather(cityId, cityName);
    };
    
    // 加载城市天气数据 - 使用和风天气API
    window.WeatherApp.loadCityWeather = async function(cityId, cityName) {
        console.log(`加载${cityName}的天气数据`);
        
        // 更新当前时间
        const now = new Date();
        const formattedTime = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // 添加DOM元素存在性检查，避免空引用错误
        const selectedCityNameEl = document.getElementById('selectedCityName');
        const selectedCityTimeEl = document.getElementById('selectedCityTime');
        
        // 只在元素存在时更新内容
        if (selectedCityNameEl) {
            selectedCityNameEl.textContent = cityName;
        }
        if (selectedCityTimeEl) {
            selectedCityTimeEl.textContent = formattedTime;
        }
        
        try {
            const config = window.WEATHER_CONFIG.weatherApi;
            
            // 获取天气数据
            const weatherUrl = `${config.baseUrl}/weather/now?location=${cityId}&key=${config.key}`;
            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();
            
            // 获取空气质量数据
            const aqiUrl = `${config.baseUrl}/air/now?location=${cityId}&key=${config.key}`;
            const aqiResponse = await fetch(aqiUrl);
            const aqiData = await aqiResponse.json();
            
            // 准备天气数据对象，默认值为"--"
            const cityWeather = {
                code: weatherData.now?.icon || '--',
                text: weatherData.now?.text || '--',
                temp: weatherData.now?.temp || '--',
                humidity: weatherData.now?.humidity || '--',
                windSpeed: weatherData.now?.windSpeed || '--',
                pressure: weatherData.now?.pressure || '--',
                visibility: weatherData.now?.vis || '--',
                aqi: aqiData.now?.aqi || '--'
            };
            
            // 更新UI显示 - 添加DOM元素存在性检查
            const weatherIconEl = document.getElementById('selectedCityWeatherIcon');
            const tempEl = document.getElementById('selectedCityTemp');
            const weatherTextEl = document.getElementById('selectedCityWeather');
            const humidityEl = document.getElementById('humidity');
            const windSpeedEl = document.getElementById('windSpeed');
            const pressureEl = document.getElementById('pressure');
            const visibilityEl = document.getElementById('visibility');
            const aqiEl = document.getElementById('aqi');
            
            // 只在元素存在时更新内容
            if (weatherIconEl) weatherIconEl.textContent = this.weatherIcons[cityWeather.code] || '🌤️';
            if (tempEl) tempEl.textContent = `${cityWeather.temp}°C`;
            if (weatherTextEl) weatherTextEl.textContent = cityWeather.text;
            if (humidityEl) humidityEl.textContent = cityWeather.humidity !== '--' ? `${cityWeather.humidity}%` : '--';
            if (windSpeedEl) windSpeedEl.textContent = cityWeather.windSpeed !== '--' ? `${cityWeather.windSpeed} km/h` : '--';
            if (pressureEl) pressureEl.textContent = cityWeather.pressure !== '--' ? `${cityWeather.pressure} hPa` : '--';
            if (visibilityEl) visibilityEl.textContent = cityWeather.visibility !== '--' ? `${cityWeather.visibility} km` : '--';
            if (aqiEl) aqiEl.textContent = cityWeather.aqi;
            
            // 存储天气数据
            this.config.weatherData[cityId] = cityWeather;
            
        } catch (error) {
            console.error(`获取${cityName}天气数据失败:`, error);
            
            // 显示默认的"--"值 - 添加DOM元素存在性检查
            if (document.getElementById('selectedCityWeatherIcon')) document.getElementById('selectedCityWeatherIcon').textContent = '🌤️';
            if (document.getElementById('selectedCityTemp')) document.getElementById('selectedCityTemp').textContent = '--°C';
            if (document.getElementById('selectedCityWeather')) document.getElementById('selectedCityWeather').textContent = '--';
            if (document.getElementById('humidity')) document.getElementById('humidity').textContent = '--';
            if (document.getElementById('windSpeed')) document.getElementById('windSpeed').textContent = '--';
            if (document.getElementById('pressure')) document.getElementById('pressure').textContent = '--';
            if (document.getElementById('visibility')) document.getElementById('visibility').textContent = '--';
            if (document.getElementById('aqi')) document.getElementById('aqi').textContent = '--';
        }
        
        // 更新图表
        this.updateChart().catch(error => {
            console.error('更新图表失败:', error);
        });
    };
    

    
    // 初始化图表
    window.WeatherApp.initCharts = function() {
        if (typeof echarts !== 'undefined') {
            // 初始化mainChart，如果元素存在
            const mainChartElement = document.getElementById('mainChart');
            if (mainChartElement) {
                this.config.chartInstances.mainChart = echarts.init(mainChartElement);
                // 调用异步的updateChart函数
                this.updateChart().catch(error => {
                    console.error('初始化mainChart失败:', error);
                });
            }
            
            // 避免初始化不存在的predictionChart元素
            // predictionChart元素可能在analysis.html中，但可能未使用ECharts初始化
            const predictionChartElement = document.getElementById('predictionChart');
            if (!predictionChartElement) {
                console.log('predictionChart元素不存在，跳过初始化');
            }
        }
    };
    
    // 更新图表 - 使用真实天气数据
    window.WeatherApp.updateChart = async function() {
        if (!this.config.chartInstances.mainChart) return;
        
        // 设置加载状态
        const option = {
            title: {
                text: this.getChartTitle(),
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: []
            },
            yAxis: {
                type: 'value',
                name: this.getChartYAxisName()
            },
            series: [{
                data: [],
                type: 'line',
                smooth: true
            }],
            loading: {
                show: true,
                text: '加载中...',
                color: '#c23531',
                textColor: '#000',
                maskColor: 'rgba(255, 255, 255, 0.8)',
                zlevel: 0
            }
        };
        
        this.config.chartInstances.mainChart.setOption(option);
        
        try {
            // 获取天气数据（fetchWeatherHistory会自动处理API调用失败的情况，返回符合时间范围的数据）
            console.log(`准备获取${this.config.currentTimeRange}时间范围的天气数据`);
            const weatherData = await this.fetchWeatherHistory();
            
            // 验证数据有效性
            let displayHours, displayValues;
            
            if (weatherData && weatherData.hours && weatherData.values && 
                weatherData.hours.length > 0 && weatherData.values.length > 0) {
                displayHours = weatherData.hours;
                displayValues = weatherData.values;
                console.log(`使用获取的数据: 时间标签${displayHours.length}个, 数据值${displayValues.length}个`);
            } else {
                console.warn('获取的数据无效，显示空数据状态');
                displayHours = [];
                displayValues = [];
            }
            
            // 更新图表配置
            const updatedOption = {
                xAxis: {
                    data: displayHours
                },
                series: [{
                    data: displayValues
                }],
                loading: {
                    show: false
                }
            };
            
            console.log('应用图表配置，更新显示');
            this.config.chartInstances.mainChart.setOption(updatedOption);
        } catch (error) {
            console.error('更新图表时出错:', error);
            
            // 失败时显示空数据状态
            try {
                console.log('显示空数据状态');
                
                const fallbackOption = {
                    xAxis: {
                        data: []
                    },
                    series: [{
                        data: []
                    }],
                    loading: {
                        show: false
                    },
                    title: {
                        text: this.getChartTitle() + ' - 数据加载失败',
                        left: 'center'
                    }
                };
                
                this.config.chartInstances.mainChart.setOption(fallbackOption);
            } catch (fallbackError) {
                console.error('生成备用数据也失败了:', fallbackError);
            }
        }
    };
    
    // 获取天气历史数据
    window.WeatherApp.fetchWeatherHistory = async function() {
        const cityId = this.config.currentCity.id;
        const timeRange = this.config.currentTimeRange;
        const config = window.WEATHER_CONFIG.weatherApi;
        
        try {
            console.log(`fetchWeatherHistory: 城市ID=${cityId}, 时间范围=${timeRange}`);
            
            // 根据时间范围选择不同的API端点
            let url, dataKey;
            
            switch (timeRange) {
                case '24h':
                case '48h':
                case '72h':
                    // 逐小时预报
                    url = `${config.baseUrl}/weather/24h?location=${cityId}&key=${config.key}`;
                    dataKey = 'hourly';
                    break;
                case '7d':
                    // 7天预报
                    url = `${config.baseUrl}/weather/7d?location=${cityId}&key=${config.key}`;
                    dataKey = 'daily';
                    break;
                case '15d':
                    // 15天预报
                    url = `${config.baseUrl}/weather/15d?location=${cityId}&key=${config.key}`;
                    dataKey = 'daily';
                    break;
                case '30d':
                    // 30天预报
                    url = `${config.baseUrl}/weather/30d?location=${cityId}&key=${config.key}`;
                    dataKey = 'daily';
                    break;
                default:
                    // 默认使用24小时预报
                    url = `${config.baseUrl}/weather/24h?location=${cityId}&key=${config.key}`;
                    dataKey = 'hourly';
            }
            
            console.log(`获取${timeRange}时间范围的天气数据，URL: ${url}`);
            
            const response = await fetch(url);
            console.log(`API响应状态: ${response.status}`);
            
            const data = await response.json();
            console.log('API返回数据结构:', Object.keys(data));
            
            // 检查API响应是否有效
            if (data.code === '200' && data[dataKey] && Array.isArray(data[dataKey]) && data[dataKey].length > 0) {
                console.log(`获取到${data[dataKey].length}条${dataKey === 'hourly' ? '逐小时' : '每日'}数据`);
                
                const labels = [];
                const values = [];
                
                // 安全的时间标签生成函数
                function getSafeTimeLabel(item) {
                    // 使用默认值和可选链操作的思想
                    const fxTime = (item || {}).fxTime;
                    if (typeof fxTime !== 'string') return '00:00';
                    
                    const timeParts = fxTime.split(' ');
                    const timeString = timeParts[1] || '';
                    return typeof timeString === 'string' && timeString.length >= 5 
                        ? timeString.slice(0, 5) // 使用slice代替substring，更安全
                        : '00:00';
                }
                
                // 安全的日期标签生成函数
                function getSafeDateLabel(item) {
                    const fxDate = (item || {}).fxDate;
                    if (!fxDate) return '01-01';
                    
                    try {
                        const date = new Date(fxDate);
                        if (isNaN(date.getTime())) return '01-01';
                        
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${month}-${day}`;
                    } catch {
                        return '01-01';
                    }
                }
                
                // 处理返回的数据
                data[dataKey].forEach(item => {
                    let label;
                    
                    try {
                        if (dataKey === 'hourly') {
                            // 使用函数式方法处理时间标签，避免任何undefined访问
                            label = getSafeTimeLabel(item);
                        } else {
                            // 使用函数式方法处理日期标签，避免任何undefined访问
                            label = getSafeDateLabel(item);
                        }
                    } catch (e) {
                        console.error('生成标签时出错:', e);
                        label = dataKey === 'hourly' ? '00:00' : '01-01';
                    }
                    
                    labels.push(label);
                    
                    // 根据当前图表类型提取对应数据
                    switch (this.config.currentChartType) {
                        case 'temperature':
                            if (dataKey === 'hourly') {
                                values.push(parseInt(item.temp) || 0);
                            } else {
                                // 日预报使用平均温度或最高温度
                                // 新API使用tempMax字段表示最高温度
                                values.push(parseInt(item.tempMax) || 0);
                            }
                            break;
                        case 'humidity':
                            // 新API使用humidity字段表示相对湿度
                            values.push(parseInt(item.humidity) || 0);
                            break;
                        case 'pressure':
                            // 新API使用pressure字段表示大气压强
                            values.push(parseInt(item.pressure) || 0);
                            break;
                        case 'windSpeed':
                            // 新API的windSpeedDay/windSpeedNight字段已经是公里/小时单位，无需转换
                            if (dataKey === 'hourly') {
                                values.push(parseFloat(item.windSpeed) * 3.6 || 0);
                            } else {
                                // 日预报取白天风速
                                values.push(parseFloat(item.windSpeedDay) || 0);
                            }
                            break;
                        case 'precipitation':
                            // 新API使用precip字段表示降水量
                            values.push(parseFloat(item.precip) || 0);
                            break;
                        default:
                            if (dataKey === 'hourly') {
                                values.push(parseInt(item.temp) || 0);
                            } else {
                                values.push(parseInt(item.tempMax) || 0);
                            }
                    }
                });
                
                // 处理所有时间范围的数据，确保时间轴正确显示
                // 对于小时级数据（24h, 48h, 72h），生成连续的时间标签
                if ((timeRange === '24h' || timeRange === '48h' || timeRange === '72h') && labels.length > 0) {
                    console.log(`处理${timeRange}时间范围的小时数据`);
                    const hoursToGenerate = timeRange === '24h' ? 24 : (timeRange === '48h' ? 48 : 72);
                    const extendedLabels = [];
                    const extendedValues = [];
                    
                    // 获取当前时间
                    const now = new Date();
                    
                    // 生成从现在到未来的连续时间（修正时间轴顺序）
                    for (let i = 0; i < hoursToGenerate; i++) {
                        // 确保计算时间时使用正确的毫秒数
                        const time = new Date(now.getTime() + i * 60 * 60 * 1000);
                        // 格式化时间标签
                        const hours = String(time.getHours()).padStart(2, '0');
                        const minutes = String(time.getMinutes()).padStart(2, '0');
                        const label = `${hours}:${minutes}`;
                        
                        // 确保从原始数据中获取对应的值，避免数据重复
                        const valueIndex = i % Math.max(1, values.length);
                        extendedLabels.push(label);
                        extendedValues.push(values[valueIndex]);
                    }
                    
                    console.log(`返回处理后的数据: ${extendedLabels.length}个标签`);
                    return { hours: extendedLabels, values: extendedValues };
                }
                
                // 对于24h，7d，15d，30d范围，API已直接返回对应天数的数据，无需客户端扩展
                // 直接返回API提供的原始数据
                
                console.log(`成功获取真实天气数据: ${labels.length}个数据点`);
                return { hours: labels, values };
            }
            
            // API返回数据无效，返回空数据结构
            console.log('API返回数据无效，返回空数据结构');
            return { hours: [], values: [] };
        } catch (error) {
            console.error('获取天气历史数据时出错:', error.message);
            // API调用失败，返回空数据结构
            console.log('API调用失败，返回空数据结构');
            return { hours: [], values: [] };
        }
    };
    
    // 不生成任何模拟数据
    window.WeatherApp.generateTimeRangeSpecificData = function(timeRange) {
        console.log(`generateTimeRangeSpecificData: 不生成模拟数据，仅返回空数据集`);
        // 不生成任何模拟数据，返回空的数据集
        return { hours: [], values: [] };
    };
    
    // 不生成任何模拟数据
    window.WeatherApp.generateMockHours = function() {
        console.log(`generateMockHours: 不生成模拟数据，仅返回空数组`);
        // 不生成任何模拟时间数据，返回空数组
        return [];
    };
    
    // 生成模拟数据值（作为备用）
    window.WeatherApp.generateMockValues = function(count) {
        const values = [];
        
        for (let i = 0; i < count; i++) {
            if (this.config.currentChartType === 'temperature') {
                values.push(Math.floor(Math.random() * 15) + 10); // 10-25°C
            } else if (this.config.currentChartType === 'humidity') {
                values.push(Math.floor(Math.random() * 40) + 40); // 40-80%
            } else if (this.config.currentChartType === 'pressure') {
                values.push(Math.floor(Math.random() * 20) + 1000); // 1000-1020 hPa
            } else if (this.config.currentChartType === 'windSpeed') {
                values.push(Math.floor(Math.random() * 20) + 5); // 5-25 km/h
            } else {
                values.push(Math.floor(Math.random() * 10)); // 0-10 mm
            }
        }
        
        return values;
    };
    
    // 获取图表标题
    window.WeatherApp.getChartTitle = function() {
        const titles = {
            'temperature': '温度趋势',
            'humidity': '湿度变化',
            'pressure': '气压变化',
            'windSpeed': '风速变化',
            'precipitation': '降水量'
        };
        return titles[this.config.currentChartType] || '天气趋势';
    };
    
    // 获取Y轴名称
    window.WeatherApp.getChartYAxisName = function() {
        const names = {
            'temperature': '温度 (°C)',
            'humidity': '湿度 (%)',
            'pressure': '气压 (hPa)',
            'windSpeed': '风速 (km/h)',
            'precipitation': '降水量 (mm)'
        };
        return names[this.config.currentChartType] || '';
    };
    
    // 设置图表类型
    window.WeatherApp.setChartType = async function(type) {
        this.config.currentChartType = type;
        await this.updateChart().catch(error => {
            console.error('切换图表类型后更新图表失败:', error);
        });
    };
    
    // 设置时间范围
    window.WeatherApp.setTimeRange = function(range) {
        console.log(`切换时间范围到: ${range}`);
        this.config.currentTimeRange = range;
        
        // 异步更新图表数据
        this.updateChart().then(() => {
            console.log('图表数据更新完成');
        }).catch(error => {
            console.error('切换时间范围后更新图表失败:', error);
        });
    };
    
    // 刷新所有数据
    window.WeatherApp.refreshAllData = function() {
        this.loadCityWeather(this.config.currentCity.id, this.config.currentCity.name);
    };
    
    // 添加城市 - 使用和风天气地理编码API进行全球城市搜索
    window.WeatherApp.addCity = async function() {
        const keyword = document.getElementById('citySearch').value.trim();
        if (!keyword) return;
        
        try {
            // 使用和风天气的地理编码API搜索城市
            const config = window.WEATHER_CONFIG.weatherApi;
            const url = `${config.geoBaseUrl}/city/lookup?location=${encodeURIComponent(keyword)}&key=${config.key}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code === '200' && data.location && data.location.length > 0) {
                // 选择第一个搜索结果
                const city = data.location[0];
                this.selectCity(city.id, city.name);
                document.getElementById('citySearch').value = '';
                this.showNotification(`已添加城市: ${city.name}`, 'success');
            } else {
                this.showNotification('未找到匹配的城市', 'error');
            }
        } catch (error) {
            console.error('城市搜索失败:', error);
            this.showNotification('城市搜索失败，请稍后重试', 'error');
        }
    };
    
    // 移动端添加城市 - 使用和风天气地理编码API进行全球城市搜索
    window.WeatherApp.addCityMobile = async function() {
        const keyword = document.getElementById('mobileCitySearch').value.trim();
        if (!keyword) return;
        
        try {
            // 使用和风天气的地理编码API搜索城市
            const config = window.WEATHER_CONFIG.weatherApi;
            const url = `${config.geoBaseUrl}/city/lookup?location=${encodeURIComponent(keyword)}&key=${config.key}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code === '200' && data.location && data.location.length > 0) {
                // 选择第一个搜索结果
                const city = data.location[0];
                this.selectCity(city.id, city.name);
                document.getElementById('mobileCitySearch').value = '';
                this.showNotification(`已添加城市: ${city.name}`, 'success');
            } else {
                this.showNotification('未找到匹配的城市', 'error');
            }
        } catch (error) {
            console.error('城市搜索失败:', error);
            this.showNotification('城市搜索失败，请稍后重试', 'error');
        }
    };
    
    // 切换移动端菜单
    window.WeatherApp.toggleMobileMenu = function() {
        const menu = document.getElementById('mobileMenu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    };
    
    // 导出数据功能 - 支持CSV和JSON格式
    window.WeatherApp.exportData = async function() {
        try {
            // 获取当前图表数据
            console.log('准备导出数据...');
            const weatherData = await this.fetchWeatherHistory();
            
            // 如果没有数据，生成模拟数据
            let exportData;
            if (weatherData && weatherData.hours && weatherData.values) {
                exportData = {
                    hours: weatherData.hours,
                    values: weatherData.values,
                    type: this.config.currentChartType,
                    timeRange: this.config.currentTimeRange,
                    city: this.config.currentCity.name,
                    exportTime: new Date().toLocaleString('zh-CN')
                };
                console.log('获取到实际数据，准备导出');
            } else {
                // 生成备用数据
                const fallbackData = this.generateTimeRangeSpecificData(this.config.currentTimeRange);
                exportData = {
                    hours: fallbackData.hours,
                    values: this.generateMockValues(fallbackData.hours.length),
                    type: this.config.currentChartType,
                    timeRange: this.config.currentTimeRange,
                    city: this.config.currentCity.name,
                    exportTime: new Date().toLocaleString('zh-CN')
                };
                console.log('使用备用数据进行导出');
            }
            
            // 显示格式选择对话框
            const format = prompt('请选择导出格式：\n1. CSV格式\n2. JSON格式\n\n请输入 1 或 2', '1');
            
            if (!format || (format !== '1' && format !== '2')) {
                console.log('用户取消导出');
                return;
            }
            
            let content, filename, mimeType;
            
            if (format === '1') {
                // 导出为CSV格式
                content = this.convertToCSV(exportData);
                filename = `${this.config.currentCity.name}_${this.getChartTitle()}_${this.config.currentTimeRange}_${new Date().getTime()}.csv`;
                mimeType = 'text/csv;charset=utf-8;';
                console.log('准备导出CSV文件:', filename);
            } else {
                // 导出为JSON格式
                content = JSON.stringify(exportData, null, 2);
                filename = `${this.config.currentCity.name}_${this.getChartTitle()}_${this.config.currentTimeRange}_${new Date().getTime()}.json`;
                mimeType = 'application/json;charset=utf-8;';
                console.log('准备导出JSON文件:', filename);
            }
            
            // 创建下载链接
            const link = document.createElement('a');
            const blob = new Blob([content], { type: mimeType });
            
            // 处理不同浏览器的兼容性
            if (navigator.msSaveBlob) {
                // IE 10+
                navigator.msSaveBlob(blob, filename);
            } else {
                // 其他现代浏览器
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = filename;
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // 清理URL对象
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                }, 100);
            }
            
            console.log('数据导出成功');
            this.showNotification('数据导出成功！', 'success');
        } catch (error) {
            console.error('数据导出失败:', error);
            this.showNotification('数据导出失败，请重试', 'error');
        }
    };
    
    // 将数据转换为CSV格式
    window.WeatherApp.convertToCSV = function(data) {
        // 添加BOM以确保Excel正确识别UTF-8编码
        let csv = '\uFEFF';
        
        // 添加标题行
        const titleMap = {
            'temperature': '温度 (°C)',
            'humidity': '湿度 (%)',
            'pressure': '气压 (hPa)',
            'windSpeed': '风速 (km/h)',
            'precipitation': '降水量 (mm)'
        };
        
        // 添加元数据信息
        csv += `城市: ${data.city}\n`;
        csv += `数据类型: ${titleMap[data.type] || data.type}\n`;
        csv += `时间范围: ${data.timeRange}\n`;
        csv += `导出时间: ${data.exportTime}\n\n`;
        
        // 添加表头
        csv += '时间点,' + (titleMap[data.type] || '数值') + '\n';
        
        // 添加数据行
        for (let i = 0; i < data.hours.length; i++) {
            const hour = data.hours[i];
            const value = data.values[i];
            csv += `"${hour}",${value}\n`;
        }
        
        return csv;
    };
    
    // 显示天气预警 - 使用和风天气API获取实时预警信息
    window.WeatherApp.showAlerts = async function() {
        try {
            // 使用默认城市ID，不依赖用户位置
            const cityId = this.config.currentCity.id || '101010100'; // 默认使用北京
            const config = window.WEATHER_CONFIG.weatherApi;
            const url = `${config.baseUrl}/warning/now?location=${cityId}&key=${config.key}`;
            
            console.log(`获取预警信息，使用默认城市ID: ${cityId}`);
            
            // 显示加载状态
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg z-50';
            loadingMessage.textContent = '正在获取天气预警信息...';
            document.body.appendChild(loadingMessage);
            
            // 调用API获取预警信息
            const response = await fetch(url);
            const data = await response.json();
            
            // 移除加载提示
            document.body.removeChild(loadingMessage);
            
            console.log('预警API响应:', data);
            
            // 检查API响应
            if (data.code !== '200') {
                console.warn('获取预警信息失败，API返回错误:', data.code);
                this.showAlertModal('获取预警信息失败', '无法连接到天气预警服务，请稍后再试。', 'warning');
                return;
            }
            
            // 处理预警数据
            const warningList = data.warning || [];
            
            if (warningList.length === 0) {
                // 无预警信息
                console.log('当前无天气预警');
                this.showAlertModal('天气预警', '当前无天气预警信息', 'info');
            } else {
                // 有预警信息，格式化显示
                console.log(`发现${warningList.length}条天气预警`);
                const alertsHtml = this.formatWarningMessages(warningList);
                this.showAlertModal('天气预警信息', alertsHtml, 'warning');
            }
        } catch (error) {
            console.error('获取天气预警时出错:', error);
            
            // 移除可能存在的加载提示
            const loadingElements = document.querySelectorAll('.fixed.top-4.right-4.bg-blue-500');
            loadingElements.forEach(el => el.remove());
            
            // 显示错误信息
            this.showAlertModal('获取预警失败', '获取天气预警信息时发生错误，请检查网络连接后重试。', 'error');
        }
    };
    
    // 格式化预警信息为HTML
    window.WeatherApp.formatWarningMessages = function(warningList) {
        let html = `<div class="space-y-4">
            <p class="text-lg font-bold text-yellow-600">当前地区共有 ${warningList.length} 条预警信息</p>
        `;
        
        warningList.forEach((warning, index) => {
            // 预警等级颜色映射
            const levelColorMap = {
                '一般': 'bg-blue-100 text-blue-800',
                '较重': 'bg-yellow-100 text-yellow-800',
                '严重': 'bg-orange-100 text-orange-800',
                '特别严重': 'bg-red-100 text-red-800'
            };
            
            const level = warning.level || '未知';
            const levelClass = levelColorMap[level] || 'bg-gray-100 text-gray-800';
            
            // 格式化发布时间
            const pubTime = warning.pubTime ? new Date(warning.pubTime).toLocaleString('zh-CN') : '未知';
            
            html += `
                <div class="border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-bold text-red-600">${warning.sender} - ${warning.title}</h3>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${levelClass}">${level}</span>
                    </div>
                    <p class="text-gray-700 mb-2">${warning.text || '暂无详细信息'}</p>
                    <div class="text-sm text-gray-500">
                        <p>发布时间: ${pubTime}</p>
                        ${warning.effective ? `<p>生效时间: ${new Date(warning.effective).toLocaleString('zh-CN')}</p>` : ''}
                        ${warning.expires ? `<p>过期时间: ${new Date(warning.expires).toLocaleString('zh-CN')}</p>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        return html;
    };
    
    // 显示预警模态框
    window.WeatherApp.showAlertModal = function(title, message, type = 'info') {
        // 移除已存在的模态框
        const existingModal = document.getElementById('weatherAlertModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // 创建模态框背景
        const modal = document.createElement('div');
        modal.id = 'weatherAlertModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.style.backdropFilter = 'blur(2px)';
        
        // 确定图标和样式
        let icon, bgColor;
        switch (type) {
            case 'warning':
                icon = '⚠️';
                bgColor = 'border-yellow-500';
                break;
            case 'error':
                icon = '❌';
                bgColor = 'border-red-500';
                break;
            case 'success':
                icon = '✅';
                bgColor = 'border-green-500';
                break;
            default:
                icon = 'ℹ️';
                bgColor = 'border-blue-500';
        }
        
        // 模态框内容
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border-l-4 ${bgColor}">
                <div class="flex items-center justify-between p-4 border-b">
                    <div class="flex items-center space-x-2">
                        <span class="text-2xl">${icon}</span>
                        <h2 class="text-xl font-bold text-gray-800">${title}</h2>
                    </div>
                    <button id="closeModalBtn" class="text-gray-500 hover:text-gray-800 text-xl">×</button>
                </div>
                <div class="p-6 text-gray-700">
                    ${typeof message === 'string' ? message : message.toString()}
                </div>
                <div class="flex justify-end p-4 border-t">
                    <button id="confirmModalBtn" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        确定
                    </button>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(modal);
        
        // 添加事件监听
        const closeBtn = document.getElementById('closeModalBtn');
        const confirmBtn = document.getElementById('confirmModalBtn');
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        closeBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', closeModal);
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // 按ESC键关闭
        document.addEventListener('keydown', function handleEsc(event) {
            if (event.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        });
    };
    
    // 暴露必要的方法到全局作用域
    window.initWeatherApp = function() {
        window.WeatherApp.init();
    };
    window.selectCity = function(id, name) {
        window.WeatherApp.selectCity(id, name);
    };
    window.setTimeRange = async function(range) {
        await window.WeatherApp.setTimeRange(range);
    };
    window.refreshAllData = function() {
        window.WeatherApp.refreshAllData();
    };
    window.addCity = function() {
        window.WeatherApp.addCity();
    };
    window.exportData = function() {
        window.WeatherApp.exportData();
    };
    window.showAlerts = function() {
        window.WeatherApp.showAlerts();
    };
    window.toggleMobileMenu = function() {
        window.WeatherApp.toggleMobileMenu();
    };
    window.addCityMobile = function() {
        window.WeatherApp.addCityMobile();
    };
    
    // 添加图表类型变更事件监听
    document.addEventListener('DOMContentLoaded', function() {
        const chartTypeSelect = document.getElementById('chartType');
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', function() {
                window.WeatherApp.setChartType(this.value);
            });
        }
        
        // 初始化应用
        window.initWeatherApp();
    });
    
    // 获取当前位置天气信息
    window.getCurrentLocationWeather = async function() {
        try {
            const weatherApp = window.WeatherApp;
            weatherApp.showNotification('正在获取您的当前位置...', 'info');
            
            // 获取用户位置
            const location = await weatherApp.getUserLocation();
            
            // 选择并加载城市天气
            weatherApp.selectCity(location.id, location.name);
            weatherApp.showNotification(`已切换到您的当前位置: ${location.name}`, 'success');
        } catch (error) {
            console.error('获取当前位置失败:', error);
            window.WeatherApp.showNotification('获取位置失败，请检查定位权限设置', 'error');
        }
    };
    
    console.log('天气应用核心模块已加载完成');
})();