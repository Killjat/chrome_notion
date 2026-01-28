const db = require('./db');

// 数据库迁移脚本
const migrations = [
  {
    version: 1,
    name: 'create_tasks_table',
    up: `
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
    `,
    down: 'DROP TABLE IF EXISTS tasks'
  },
  {
    version: 2,
    name: 'create_project_templates_table',
    up: `
      CREATE TABLE IF NOT EXISTS project_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        template_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    down: 'DROP TABLE IF EXISTS project_templates'
  },
  {
    version: 3,
    name: 'create_task_history_table',
    up: `
      CREATE TABLE IF NOT EXISTS task_history (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        old_status TEXT,
        new_status TEXT,
        changed_by TEXT,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id)
      )
    `,
    down: 'DROP TABLE IF EXISTS task_history'
  }
];

// 创建迁移版本表
function createMigrationTable() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// 获取已应用的迁移版本
function getAppliedMigrations() {
  return new Promise((resolve, reject) => {
    db.all('SELECT version FROM migrations ORDER BY version', (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => row.version));
    });
  });
}

// 应用迁移
function applyMigration(migration) {
  return new Promise((resolve, reject) => {
    db.run(migration.up, (err) => {
      if (err) {
        reject(err);
      } else {
        db.run(
          'INSERT INTO migrations (version, name) VALUES (?, ?)',
          [migration.version, migration.name],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      }
    });
  });
}

// 运行所有待应用的迁移
async function runMigrations() {
  try {
    await createMigrationTable();
    const appliedVersions = await getAppliedMigrations();
    
    for (const migration of migrations) {
      if (!appliedVersions.includes(migration.version)) {
        console.log(`应用迁移: ${migration.name}`);
        await applyMigration(migration);
        console.log(`迁移完成: ${migration.name}`);
      }
    }
    
    console.log('所有数据库迁移已完成');
  } catch (error) {
    console.error('数据库迁移失败:', error);
    throw error;
  }
}

module.exports = { runMigrations };