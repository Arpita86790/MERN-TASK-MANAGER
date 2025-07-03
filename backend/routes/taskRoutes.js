const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.post('/smart-assign', taskController.smartAssignTask);
router.delete('/:id', taskController.deleteTask); 

module.exports = router;
