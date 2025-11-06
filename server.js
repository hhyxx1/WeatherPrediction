const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const HOST = 'localhost';

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    console.log(`Request for ${req.url} by method ${req.method}`);
    
    // 特殊处理Vite客户端请求，避免404错误
    if (req.url === '/@vite/client') {
        res.writeHead(200, {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-cache'
        });
        res.end('// Vite client placeholder - not needed for production');
        return;
    }
    
    // 获取文件路径，默认访问index.html
    // 移除URL中的查询参数和哈希部分
    let cleanUrl = req.url.split('?')[0].split('#')[0];
    let filePath = '.' + cleanUrl;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // 处理分析页面的直接访问
    if (filePath === './analysis') {
        filePath = './analysis.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // 设置通用响应头
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com https://fonts.gstatic.font.im https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self' https://api.qweather.com https://geoapi.qweather.com https://devapi.qweather.com https://archive-api.open-meteo.com https://api.deepseek.com;");
    
    // 设置缓存控制头，针对静态资源
    if (extname !== '.html') {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24小时
    } else {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1小时
    }
    
    // 读取并提供文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            // 检查是否为字体文件请求
            const isFontFile = ['.woff', '.woff2', '.ttf', '.otf', '.eot'].some(ext => 
                extname.toLowerCase() === ext
            );
            
            if (error.code === 'ENOENT') {
                // 文件不存在，尝试提供404页面
                fs.readFile('./404.html', (error404, content404) => {
                    if (error404) {
                        res.writeHead(500);
                        res.end(`Server Error: ${error404.code}`);
                        return;
                    }
                    res.writeHead(404, {
                        'Content-Type': 'text/html; charset=utf-8'
                    });
                    res.end(content404, 'utf-8');
                });
            } else {
                // 对字体文件的网络相关错误提供更健壮的处理
                if (isFontFile && ['ECONNRESET', 'ETIMEDOUT', 'ENETUNREACH'].includes(error.code)) {
                    console.warn(`Network error serving font file: ${error.code} - ${filePath}`);
                    // 设置重试头信息
                    res.setHeader('Retry-After', '30'); // 建议客户端30秒后重试
                    res.writeHead(503, { 'Content-Type': 'text/plain' });
                    res.end('Service Unavailable - Please try again later');
                } else {
                    // 其他服务器错误
                    res.writeHead(500);
                    res.end(`Server Error: ${error.code}`);
                }
            }
        } else {
            // 成功找到文件
            // 为字体文件添加额外的缓存策略
            if ([ '.woff', '.woff2', '.ttf', '.otf', '.eot' ].some(ext => extname.toLowerCase() === ext)) {
                res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // 7天
            }
            res.writeHead(200);
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
    console.log(`Analysis page available at http://${HOST}:${PORT}/analysis.html`);
    console.log('Press Ctrl+C to stop the server');
});