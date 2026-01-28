#!/bin/bash

# 用户信息检测器 - 简化远程部署脚本 (不使用Nginx)
echo "🚀 开始简化部署用户信息检测器..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装PM2..."
    sudo npm install -g pm2
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p logs

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 安装前端依赖
echo "📦 安装前端依赖..."
cd client
npm install
cd ..

# 构建前端应用
echo "🔨 构建前端应用..."
cd client
npm run build
cd ..

# 停止现有进程
echo "🛑 停止现有进程..."
pm2 stop user-info-detector 2>/dev/null || true
pm2 delete user-info-detector 2>/dev/null || true

# 启动应用
echo "🚀 启动应用..."
pm2 start ecosystem.config.js --env production

# 保存PM2配置
pm2 save
pm2 startup

# 检查应用状态
echo "🔍 检查应用状态..."
sleep 5
pm2 status

# 检查应用健康状态
echo "🏥 检查应用健康状态..."
if curl -f http://localhost:3001/api/tasks/stats > /dev/null 2>&1; then
    echo "✅ 应用启动成功！"
    echo ""
    echo "🌐 访问地址："
    echo "   用户产品: http://your-server-ip:3001"
    echo "   看板管理: http://your-server-ip:3001/kanban"
    echo ""
    echo "📊 管理命令："
    echo "   查看状态: pm2 status"
    echo "   查看日志: pm2 logs user-info-detector"
    echo "   重启应用: pm2 restart user-info-detector"
    echo "   停止应用: pm2 stop user-info-detector"
else
    echo "❌ 应用启动失败，请检查日志"
    pm2 logs user-info-detector --lines 20
    exit 1
fi

echo "🎉 简化部署完成！"