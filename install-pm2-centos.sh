#!/bin/bash

# CentOS 系统安装 PM2 完整脚本
echo "🚀 开始在 CentOS 系统上安装 PM2..."

# 检查系统版本
if [ -f /etc/redhat-release ]; then
    echo "✅ 检测到 Red Hat 系列系统"
    cat /etc/redhat-release
else
    echo "❌ 此脚本仅适用于 CentOS/RHEL 系统"
    exit 1
fi

# 更新系统
echo "📦 更新系统包..."
sudo yum update -y

# 安装基础工具
echo "🛠️ 安装基础工具..."
sudo yum install -y curl wget git vim

# 检查 Node.js 是否已安装
if command -v node &> /dev/null; then
    echo "✅ Node.js 已安装，版本: $(node --version)"
else
    echo "📦 安装 Node.js..."
    
    # 添加 NodeSource 仓库
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    
    # 安装 Node.js
    sudo yum install -y nodejs
    
    # 验证安装
    if command -v node &> /dev/null; then
        echo "✅ Node.js 安装成功，版本: $(node --version)"
        echo "✅ npm 版本: $(npm --version)"
    else
        echo "❌ Node.js 安装失败"
        exit 1
    fi
fi

# 检查 PM2 是否已安装
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 已安装，版本: $(pm2 --version)"
else
    echo "📦 安装 PM2..."
    
    # 全局安装 PM2
    sudo npm install -g pm2
    
    # 验证安装
    if command -v pm2 &> /dev/null; then
        echo "✅ PM2 安装成功，版本: $(pm2 --version)"
    else
        echo "❌ PM2 安装失败"
        exit 1
    fi
fi

# 配置 PM2 开机自启
echo "⚙️ 配置 PM2 开机自启..."
pm2 startup

echo "📋 显示 PM2 状态..."
pm2 list

echo "🎉 PM2 安装完成！"
echo ""
echo "📚 常用 PM2 命令："
echo "   pm2 start app.js          # 启动应用"
echo "   pm2 list                  # 查看应用列表"
echo "   pm2 logs                  # 查看日志"
echo "   pm2 monit                 # 监控面板"
echo "   pm2 restart app           # 重启应用"
echo "   pm2 stop app              # 停止应用"
echo "   pm2 delete app            # 删除应用"
echo ""
echo "🔧 下一步："
echo "   1. 上传你的项目到服务器"
echo "   2. 运行: pm2 start server/server.js --name user-info-detector"
echo "   3. 运行: pm2 save (保存配置)"