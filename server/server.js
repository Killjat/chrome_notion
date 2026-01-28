const express = require('express');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./routes/tasks');
const ipRoutes = require('./routes/ip');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use('/public', express.static(path.join(__dirname, 'public')));

// API路由
app.use('/api/tasks', taskRoutes);
app.use('/api/ip', ipRoutes);

// 看板管理系统路由 (开发团队内部工具)
app.get('/kanban', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/kanban.html'));
});

// 服务前端应用 (用户产品)
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`用户产品: http://localhost:${PORT}`);
  console.log(`看板管理: http://localhost:${PORT}/kanban`);
});