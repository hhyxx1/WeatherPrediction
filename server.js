const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8092;
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
    let filePath = '.' + req.url;
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
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;");
    
    // 设置缓存控制头，针对静态资源
    if (extname !== '.html') {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24小时
    } else {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1小时
    }
    
    // 读取并提供文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
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
                // 其他服务器错误
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // 成功找到文件
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