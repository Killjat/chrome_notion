#!/bin/bash

# 零环境差异部署脚本 - 使用 Docker
echo "🚀 开始零环境差异部署..."

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "请使用 root 用户运行此脚本，或在命令前加 sudo"
    exit 1
fi

# 检测系统类型
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    echo "✅ 检测到系统: $OS"
else
    echo "❌ 无法检测系统类型"
    exit 1
fi

# 安装 Docker (自动适配不同系统)
install_docker() {
    if command -v docker &> /dev/null; then
        echo "✅ Docker 已安装"
        docker --version
        return
    fi

    echo "📦 安装 Docker..."
    
    # 通用 Docker 安装脚本
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # 启动 Docker 服务
    systemctl start docker
    systemctl enable docker
    
    # 验证安装
    if command -v docker &> /dev/null; then
        echo "✅ Docker 安装成功"
        docker --version
    else
        echo "❌ Docker 安装失败"
        exit 1
    fi
}

# 安装 Docker Compose
install_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose 已安装"
        docker-compose --version
        return
    fi

    echo "📦 安装 Docker Compose..."
    
    # 下载最新版本的 Docker Compose
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # 添加执行权限
    chmod +x /usr/local/bin/docker-compose
    
    # 验证安装
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose 安装成功"
        docker-compose --version
    else
        echo "❌ Docker Compose 安装失败"
        exit 1
    fi
}

# 配置防火墙
configure_firewall() {
    echo "🔧 配置防火墙..."
    
    # 检测防火墙类型并配置
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian
        ufw allow 3001
        echo "✅ UFW 防火墙已配置"
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL
        firewall-cmd --permanent --add-port=3001/tcp
        firewall-cmd --reload
        echo "✅ Firewalld 防火墙已配置"
    elif command -v iptables &> /dev/null; then
        # 通用 iptables
        iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
        echo "✅ iptables 防火墙已配置"
    else
        echo "⚠️ 未检测到防火墙，请手动开放 3001 端口"
    fi
}

# 部署应用
deploy_app() {
    echo "🚀 部署应用..."
    
    # 停止现有容器
    docker-compose down 2>/dev/null || true
    
    # 构建并启动容器
    docker-compose -f docker-compose-simple.yml up -d --build
    
    # 等待容器启动
    echo "⏳ 等待应用启动..."
    sleep 15
    
    # 检查容器状态
    if docker-compose -f docker-compose-simple.yml ps | grep -q "Up"; then
        echo "✅ 应用启动成功！"
        
        # 获取服务器IP
        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}')
        
        echo ""
        echo "🌐 访问地址："
        echo "   用户产品: http://${SERVER_IP}:3001"
        echo "   看板管理: http://${SERVER_IP}:3001/kanban"
        echo ""
        echo "📊 管理命令："
        echo "   查看状态: docker-compose -f docker-compose-simple.yml ps"
        echo "   查看日志: docker-compose -f docker-compose-simple.yml logs -f"
        echo "   重启应用: docker-compose -f docker-compose-simple.yml restart"
        echo "   停止应用: docker-compose -f docker-compose-simple.yml down"
        
    else
        echo "❌ 应用启动失败"
        echo "📋 查看日志："
        docker-compose -f docker-compose-simple.yml logs
        exit 1
    fi
}

# 主执行流程
main() {
    echo "🎯 开始零环境差异部署流程..."
    
    # 1. 安装 Docker
    install_docker
    
    # 2. 安装 Docker Compose
    install_docker_compose
    
    # 3. 配置防火墙
    configure_firewall
    
    # 4. 部署应用
    deploy_app
    
    echo "🎉 部署完成！无论什么系统环境，应用都能一致运行！"
}

# 执行主函数
main