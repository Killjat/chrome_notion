# 🚀 用户信息检测器 - 简化远程部署指南

## 📋 部署概述

这是一个**不使用Nginx的简化部署方案**，适合快速部署到远程服务器。应用将直接通过Node.js服务器运行，使用PM2进行进程管理。

## 🖥️ 服务器要求

### 最低配置
- **CPU**: 1核心
- **内存**: 1GB RAM
- **存储**: 5GB 可用空间
- **系统**: Ubuntu 18.04+ / CentOS 7+ / Debian 9+
- **网络**: 公网IP

### 推荐配置
- **CPU**: 2核心
- **内存**: 2GB RAM
- **存储**: 10GB 可用空间

## 🔧 快速部署步骤

### 1. 连接到服务器
```bash
# 使用SSH连接到你的服务器
ssh root@your-server-ip
# 或
ssh username@your-server-ip
```

### 2. 更新系统
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

### 3. 上传项目文件
```bash
# 方式1: 使用Git (推荐)
git clone https://github.com/your-username/user-info-detector.git
cd user-info-detector

# 方式2: 使用SCP上传
# 在本地执行：
scp -r ./user-info-detector root@your-server-ip:/root/

# 方式3: 使用rsync
rsync -avz ./user-info-detector/ root@your-server-ip:/root/user-info-detector/
```

### 4. 执行部署脚本
```bash
# 进入项目目录
cd user-info-detector

# 给脚本执行权限
chmod +x deploy-simple.sh

# 执行部署
./deploy-simple.sh
```

### 5. 配置防火墙
```bash
# Ubuntu (使用ufw)
sudo ufw allow 3001
sudo ufw enable

# CentOS (使用firewalld)
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# 或者直接使用iptables
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
```

## 🌐 访问应用

部署完成后，你可以通过以下地址访问：

- **用户产品**: `http://your-server-ip:3001`
- **看板管理**: `http://your-server-ip:3001/kanban`

## 📊 管理命令

### PM2 进程管理
```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs user-info-detector

# 实时查看日志
pm2 logs user-info-detector --follow

# 重启应用
pm2 restart user-info-detector

# 停止应用
pm2 stop user-info-detector

# 删除应用
pm2 delete user-info-detector

# 查看监控面板
pm2 monit
```

### 系统监控
```bash
# 查看系统资源
htop
# 或
top

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看端口占用
netstat -tlnp | grep 3001
```

## 🔄 更新部署

当你需要更新应用时：

```bash
# 进入项目目录
cd user-info-detector

# 拉取最新代码 (如果使用Git)
git pull

# 重新部署
./deploy-simple.sh
```

## 🆘 故障排除

### 常见问题

1. **端口被占用**
```bash
# 查看端口占用
sudo lsof -i :3001

# 杀死占用进程
sudo kill -9 <PID>
```

2. **权限问题**
```bash
# 修改文件权限
sudo chown -R $USER:$USER .
chmod +x deploy-simple.sh
```

3. **Node.js版本问题**
```bash
# 检查Node.js版本
node --version

# 如果版本过低，重新安装
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **PM2启动失败**
```bash
# 查看详细错误
pm2 logs user-info-detector --err

# 手动启动测试
node server/server.js
```

5. **防火墙阻止访问**
```bash
# 检查防火墙状态
sudo ufw status
# 或
sudo firewall-cmd --list-all

# 确保3001端口开放
sudo ufw allow 3001
```

## 🔒 安全建议

### 基础安全配置
```bash
# 1. 更改SSH端口 (可选)
sudo nano /etc/ssh/sshd_config
# 修改 Port 22 为其他端口

# 2. 禁用root登录 (可选)
sudo nano /etc/ssh/sshd_config
# 设置 PermitRootLogin no

# 3. 设置防火墙
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3001

# 4. 定期更新系统
sudo apt update && sudo apt upgrade -y
```

### 应用安全
- 看板管理页面 (`/kanban`) 建议只在内网访问
- 可以通过修改代码添加简单的访问控制
- 定期备份数据库文件

## 📈 性能优化

### 1. 启用日志轮转
```bash
# 安装logrotate配置
sudo nano /etc/logrotate.d/user-info-detector

# 添加内容：
/path/to/user-info-detector/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 root root
}
```

### 2. 设置自动重启
```bash
# PM2会自动处理进程重启
# 设置系统重启后自动启动
pm2 startup
pm2 save
```

## 📊 监控和维护

### 日志查看
```bash
# 应用日志
pm2 logs user-info-detector

# 系统日志
sudo journalctl -u pm2-root

# 访问日志 (如果配置了)
tail -f logs/access.log
```

### 数据备份
```bash
# 备份数据库
cp server/database/kanban.db backup/kanban_$(date +%Y%m%d).db

# 备份整个项目
tar -czf backup/project_$(date +%Y%m%d).tar.gz .
```

## 🎯 部署检查清单

部署完成后，请检查以下项目：

- [ ] 应用能正常启动 (`pm2 status` 显示 online)
- [ ] 端口3001可以访问
- [ ] 主页面能正常加载
- [ ] 看板页面能正常访问
- [ ] API接口能正常响应
- [ ] 防火墙已正确配置
- [ ] PM2已设置开机自启

## 📞 技术支持

如果遇到部署问题：

1. 检查 `pm2 logs user-info-detector` 的错误信息
2. 确认服务器防火墙和安全组配置
3. 验证Node.js和npm版本是否正确
4. 检查项目文件是否完整上传

---

**部署完成后的访问地址：**
- 🌐 用户产品: `http://your-server-ip:3001`
- 📋 看板管理: `http://your-server-ip:3001/kanban`

**这个简化方案的优势：**
- ✅ 配置简单，部署快速
- ✅ 资源占用少
- ✅ 维护方便
- ✅ 适合中小型项目