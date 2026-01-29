#!/bin/bash

# 最简单粗暴的运行脚本
echo "🚀 启动应用..."

# 安装依赖
npm install
cd client && npm install && npm run build && cd ..

# 直接运行
node server/server.js