# 🐧 CentOS 系统部署指南

## 📋 系统要求

### 推荐配置
- **系统**: CentOS 7.x / AlmaLinux 8.x / Rocky Linux 8.x
- **CPU**: 1核心 (推荐2核心)
- **内存**: 1GB (推荐2GB)
- **存储**: 10GB
- **网络**: 公网IP

## 🚀 CentOS 7 部署步骤

### 1. 系统更新
```bash
# 更新系统
sudo yum update -y

# 安装基础工具
sudo yum install -y wget curl git vim
```

### 2. 安装 Node.js
```bash
# 方式1: 使用 NodeSource 仓库 (推荐)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 方式2: 使用 EPEL 仓库
sudo yum install -y epel-release
sudo yum install -y nodejs npm

# 验证安装
node --version
npm --version
```

### 3. 安装 PM2
```bash
sudo npm install -g pm2
```

### 4. 配置防火墙
```bash
# 启动防火墙服务
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 开放3001端口
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# 查看开放的端口
sudo firewall-cmd --list-ports
```

### 5. 部署项目
```bash
# 克隆项目
git clone https://github.com/your-username/user-info-detector.git
cd user-info-detector

# 给脚本执行权限
chmod +x deploy-simple.sh

# 执行部署
./deploy-simple.sh
```

## 🔧 AlmaLinux/Rocky Linux 部署

### 1. 系统更新
```bash
# AlmaLinux/Rocky Linux 使用 dnf
sudo dnf update -y

# 安装基础工具
sudo dnf install -y wget curl git vim
```

### 2. 安装 Node.js
```bash
# 使用 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# 验证安装
node --version
npm --version
```

### 3. 其他步骤同 CentOS 7

## 🛠️ CentOS 专用部署脚本

创建 CentOS 专用的部署脚本：