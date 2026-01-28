const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

// 记录任务状态变更历史
function recordTaskStatusChange(taskId, oldStatus, newStatus, changedBy = 'system') {
  return new Promise((resolve, reject) => {
    const historyId = uuidv4();
    const sql = `
      INSERT INTO task_history (id, task_id, old_status, new_status, changed_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [historyId, taskId, oldStatus, newStatus, changedBy], function(err) {
      if (err) {
        console.error('记录任务历史失败:', err.message);
        reject(err);
      } else {
        resolve(historyId);
      }
    });
  });
}

// 获取任务历史记录
function getTaskHistory(taskId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM task_history 
      WHERE task_id = ? 
      ORDER BY changed_at DESC
    `;
    
    db.all(sql, [taskId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// 获取所有任务的历史统计
function getTaskHistoryStats() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        DATE(changed_at) as date,
        COUNT(*) as changes,
        SUM(CASE WHEN new_status = 'done' THEN 1 ELSE 0 END) as completed
      FROM task_history 
      WHERE changed_at >= date('now', '-30 days')
      GROUP BY DATE(changed_at)
      ORDER BY date DESC
    `;
    
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  recordTaskStatusChange,
  getTaskHistory,
  getTaskHistoryStats
};