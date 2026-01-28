const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { recordTaskStatusChange } = require('../utils/taskHistory');

const router = express.Router();

// 获取所有任务
router.get('/', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      res.json({ success: true, data: rows, total: rows.length });
    }
  });
});

// 创建新任务
router.post('/', (req, res) => {
  const { title, description, priority = 'medium' } = req.body;
  
  if (!title) {
    return res.status(400).json({ success: false, error: '任务标题不能为空' });
  }

  const id = uuidv4();
  const sql = `
    INSERT INTO tasks (id, title, description, priority)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [id, title, description, priority], function(err) {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      // 记录任务创建历史
      recordTaskStatusChange(id, null, 'todo', 'system').catch(console.error);
      
      res.json({ 
        success: true, 
        data: { id, title, description, priority, status: 'todo' }
      });
    }
  });
});

// 更新任务
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority } = req.body;
  
  // 首先获取当前任务状态，用于记录历史
  db.get('SELECT status FROM tasks WHERE id = ?', [id], (err, currentTask) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (!currentTask) {
      return res.status(404).json({ success: false, error: '任务不存在' });
    }
    
    let sql = 'UPDATE tasks SET updated_at = CURRENT_TIMESTAMP';
    const params = [];
    
    if (title !== undefined) {
      sql += ', title = ?';
      params.push(title);
    }
    if (description !== undefined) {
      sql += ', description = ?';
      params.push(description);
    }
    if (status !== undefined) {
      sql += ', status = ?';
      params.push(status);
      
      // 如果状态变为完成，记录完成时间
      if (status === 'done') {
        sql += ', completed_at = CURRENT_TIMESTAMP';
      } else if (currentTask.status === 'done' && status !== 'done') {
        // 如果从完成状态改为其他状态，清除完成时间
        sql += ', completed_at = NULL';
      }
    }
    if (priority !== undefined) {
      sql += ', priority = ?';
      params.push(priority);
    }
    
    sql += ' WHERE id = ?';
    params.push(id);

    db.run(sql, params, function(err) {
      if (err) {
        res.status(500).json({ success: false, error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ success: false, error: '任务不存在' });
      } else {
        // 记录状态变更历史
        if (status !== undefined && status !== currentTask.status) {
          recordTaskStatusChange(id, currentTask.status, status, 'user').catch(console.error);
        }
        
        res.json({ success: true, message: '任务更新成功' });
      }
    });
  });
});

// 删除任务
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ success: false, error: '任务不存在' });
    } else {
      res.json({ success: true, message: '任务删除成功' });
    }
  });
});

// 获取任务统计
router.get('/stats', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
      SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as inProgress,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
    FROM tasks
  `;
  
  db.get(sql, (err, row) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      const completionRate = row.total > 0 ? (row.done / row.total * 100).toFixed(1) : 0;
      res.json({
        success: true,
        data: {
          total: row.total,
          todo: row.todo,
          inProgress: row.inProgress,
          done: row.done,
          completionRate: parseFloat(completionRate)
        }
      });
    }
  });
});

// 获取任务历史
router.get('/:id/history', (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT * FROM task_history 
    WHERE task_id = ? 
    ORDER BY changed_at DESC
  `;
  
  db.all(sql, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      res.json({ success: true, data: rows });
    }
  });
});

module.exports = router;