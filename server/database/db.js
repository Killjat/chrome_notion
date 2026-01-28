const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'kanban.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('已连接到SQLite数据库');
    initDatabase();
  }
});

// 初始化数据库表
function initDatabase() {
  // 创建任务表
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `, (err) => {
    if (err) {
      console.error('创建任务表失败:', err.message);
    } else {
      console.log('任务表已创建或已存在');
      insertDefaultTasks();
    }
  });

  // 创建项目模板表
  db.run(`
    CREATE TABLE IF NOT EXISTS project_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      template_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建项目模板表失败:', err.message);
    } else {
      console.log('项目模板表已创建或已存在');
    }
  });

  // 创建任务历史表
  db.run(`
    CREATE TABLE IF NOT EXISTS task_history (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      old_status TEXT,
      new_status TEXT,
      changed_by TEXT,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks (id)
    )
  `, (err) => {
    if (err) {
      console.error('创建任务历史表失败:', err.message);
    } else {
      console.log('任务历史表已创建或已存在');
    }
  });
}

// 插入默认任务
function insertDefaultTasks() {
  const defaultTasks = [
    {
      id: 'task-1',
      title: 'IP归属地检测功能',
      description: '实现用户IP地址检测和地理位置查询功能',
      status: 'todo',
      priority: 'high'
    },
    {
      id: 'task-2', 
      title: '浏览器指纹识别',
      description: '收集和分析用户浏览器指纹信息',
      status: 'todo',
      priority: 'high'
    },
    {
      id: 'task-3',
      title: '操作系统检测',
      description: '识别用户操作系统和设备信息',
      status: 'todo',
      priority: 'medium'
    }
  ];

  // 检查是否已有任务，如果没有则插入默认任务
  db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
    if (err) {
      console.error('查询任务数量失败:', err.message);
    } else if (row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO tasks (id, title, description, status, priority)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      defaultTasks.forEach(task => {
        stmt.run([task.id, task.title, task.description, task.status, task.priority]);
      });
      
      stmt.finalize();
      console.log('默认任务已插入');
    }
  });
}

module.exports = db;