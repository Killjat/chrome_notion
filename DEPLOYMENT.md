# 🚀 用户信息检测器部署指南

## 📋 部署前准备

### 1. 服务器要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **内存**: 最少 2GB RAM
- **存储**: 最少 10GB 可用空间
- **网络**: 公网IP和域名

### 2. 必需软件
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装Node.js (可选，用于直接部署)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2 (可选)
sudo npm install -g pm2
```

## 🔧 部署方式

### 方式一：Docker部署 (推荐)

1. **克隆项目**
```bash
git clone <your-repo-url>
cd user-info-detector
```

2. **配置环境变量**
```bash
# 复制环境变量文件
cp .env.production .env

# 编辑配置
nano .env
# 修改域名、SSL证书路径等配置
```

3. **配置SSL证书**
```bash
# 创建SSL目录
mkdir -p ssl

# 使用Let's Encrypt获取免费SSL证书
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

4. **修改Nginx配置**
```bash
# 编辑nginx.conf
nano nginx.conf
# 将 your-domain.com 替换为你的实际域名
```

5. **执行部署**
```bash
# 运行部署脚本
./deploy.sh
```

### 方式二：PM2部署

1. **安装依赖**
```bash
npm run install-all
```

2. **构建前端**
```bash
npm run build
```

3. **启动应用**
```bash
npm run pm2:start
```

## 🔍 验证部署

### 检查服务状态
```bash
# Docker方式
docker-compose ps
docker-compose logs app

# PM2方式
pm2 status
pm2 logs user-info-detector
```

### 测试访问
```bash
# 测试API
curl http://your-domain.com/api/tasks/stats

# 测试主页
curl http://your-domain.com

# 测试看板
curl http://your-domain.com/kanban
```

## 🔒 安全配置

### 1. 防火墙设置
```bash
# 启用UFW防火墙
sudo ufw enable

# 允许SSH
sudo ufw allow ssh

# 允许HTTP和HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 检查状态
sudo ufw status
```

### 2. 看板访问限制
编辑 `nginx.conf` 中的看板部分，添加IP白名单：
```nginx
location /kanban {
    # 只允许特定IP访问
    allow 192.168.1.0/24;  # 内网
    allow your-office-ip;   # 办公室IP
    deny all;
    
    proxy_pass http://app_server;
    # ... 其他配置
}
```

### 3. SSL证书自动续期
```bash
# 添加定时任务
sudo crontab -e

# 添加以下行（每月1号凌晨2点检查续期）
0 2 1 * * /usr/bin/certbot renew --quiet && docker-compose restart nginx
```

## 📊 监控和维护

### 1. 日志查看
```bash
# Docker日志
docker-compose logs -f app
docker-compose logs -f nginx

# PM2日志
pm2 logs user-info-detector

# 系统日志
tail -f logs/combined.log
```

### 2. 性能监控
```bash
# 系统资源
htop
df -h
free -h

# Docker资源
docker stats

# PM2监控
pm2 monit
```

### 3. 数据备份
```bash
# 备份数据库
cp server/database/kanban.db backup/kanban_$(date +%Y%m%d).db

# 备份日志
tar -czf backup/logs_$(date +%Y%m%d).tar.gz logs/
```

## 🔄 更新部署

### Docker方式
```bash
git pull
./deploy.sh
```

### PM2方式
```bash
git pull
npm run build
npm run pm2:restart
```

## 🆘 故障排除

### 常见问题

1. **端口被占用**
```bash
sudo lsof -i :3001
sudo kill -9 <PID>
```

2. **权限问题**
```bash
sudo chown -R $USER:$USER .
chmod +x deploy.sh
```

3. **SSL证书问题**
```bash
# 检查证书有效性
openssl x509 -in ssl/cert.pem -text -noout
```

4. **数据库锁定**
```bash
# 重启应用释放数据库锁
docker-compose restart app
# 或
npm run pm2:restart
```

## 📞 支持

如果遇到部署问题，请检查：
1. 服务器系统要求是否满足
2. 域名DNS是否正确解析
3. 防火墙端口是否开放
4. SSL证书是否有效
5. 日志文件中的错误信息

---

**部署完成后访问地址：**
- 🌐 用户产品: https://your-domain.com
- 📋 看板管理: https://your-domain.com/kanban