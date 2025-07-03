const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');


exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedUserId } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      assignedUserId: assignedUserId || null
    });

    await ActivityLog.create({
      action: `Created task "${task.title}"`,
      userId: task.assignedUserId || null
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('Create Task Error:', err);
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};


exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({ include: ['User'] });
    res.json(tasks);
  } catch (err) {
    console.error('Get Tasks Error:', err);
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
};


exports.updateTask = async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    await task.save();

    await ActivityLog.create({
      action: `Updated task "${task.title}" → status: ${task.status}`,
      userId: task.assignedUserId || null
    });

    res.json(task);
  } catch (err) {
    console.error('Update Task Error:', err);
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};


exports.smartAssignTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    const [user] = await sequelize.query(`
      SELECT u.id, COUNT(t.id) AS taskCount
      FROM Users u
      LEFT JOIN Tasks t ON u.id = t.assignedUserId
      GROUP BY u.id
      ORDER BY taskCount ASC
      LIMIT 1;
    `, { type: Sequelize.QueryTypes.SELECT });

    if (!user) return res.status(400).json({ message: "No users available to assign" });

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      assignedUserId: user.id
    });

    await ActivityLog.create({
      action: `Smart assigned "${task.title}" to User ID ${user.id}`,
      userId: user.id
    });

    res.status(201).json({ message: "Task smart-assigned", task });
  } catch (err) {
    console.error('Smart Assign Error:', err);
    res.status(500).json({ message: 'Smart assign failed', error: err.message });
  }
};


exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await ActivityLog.create({
      action: `Deleted task "${task.title}"`,
      userId: task.assignedUserId || null
    });

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete Task Error:', err);
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};
