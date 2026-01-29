# 🚀 CI/CD 自动部署设置指南

## 📋 一次设置，永久自动部署

### 1. 推送代码到GitHub

```bash
# 初始化git仓库
git init
git add .
git commit -m "初始提交"

# 添加远程仓库
git remote add origin https://github.com/your-username/user-info-detector.git
git push -u origin main
```

### 2. 在GitHub设置密钥

进入你的GitHub仓库 → Settings → Secrets and variables → Actions

添加以下密钥：
- `HOST`: 121.43.143.169
- `USERNAME`: root  
- `PASSWORD`: 你的服务器密码

### 3. 服务器初始化（只需要做一次）

```bash
# 连接服务器
ssh root@121.43.143.169

# 安装基础环境
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs git

# 安装PM2
npm install -g pm2

# 克隆项目
cd /root
git clone https://github.com/your-username/user-info-detector.git app
cd app

# 首次部署
npm install
cd client && npm install && npm run build && cd ..
pm2 start server/server.js --name user-info-detector
pm2 save
pm2 startup
```

## 🎯 使用方法

设置完成后，每次你：
1. 修改代码
2. `git push`
3. GitHub自动部署到服务器

**就这么简单！**

## 🔧 解决网络问题

如果服务器网络有问题，添加国内镜像：

```bash
# 更换apt源
cp /etc/apt/sources.list /etc/apt/sources.list.bak
cat > /etc/apt/sources.list << EOF
deb http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse
EOF

# 更新
apt update

# 更换npm源
npm config set registry https://registry.npmmirror.com
```