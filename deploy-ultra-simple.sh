#!/bin/bash

# 超简单部署脚本 - 3步完成
echo "🚀 开始超简单部署..."

# 1. 安装 Node.js (如果没有)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 2. 安装依赖并构建
npm install
cd client && npm install && npm run build && cd ..

# 3. 直接启动
nohup node server/server.js > app.log 2>&1 &

echo "✅ 部署完成！访问 http://$(curl -s ifconfig.me):3001"