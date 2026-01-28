#!/bin/bash

# 用户信息检测器部署脚本
echo "🚀 开始部署用户信息检测器..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p logs
mkdir -p ssl

# 构建前端应用
echo "🔨 构建前端应用..."
cd client
npm install
npm run build
cd ..

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 构建新镜像
echo "🏗️ 构建Docker镜像..."
docker-compose build

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

# 检查服务状态
echo "🔍 检查服务状态..."
sleep 10
docker-compose ps

# 检查应用健康状态
echo "🏥 检查应用健康状态..."
if curl -f http://localhost:3001/api/tasks/stats > /dev/null 2>&1; then
    echo "✅ 应用启动成功！"
    echo "🌐 用户产品: http://your-domain.com"
    echo "📋 看板管理: http://your-domain.com/kanban"
else
    echo "❌ 应用启动失败，请检查日志"
    docker-compose logs app
    exit 1
fi

echo "🎉 部署完成！"