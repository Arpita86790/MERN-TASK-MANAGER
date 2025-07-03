import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'Medium',
    assignedUserId: ''
  });

  const statuses = ['todo', 'inprogress', 'done'];
  const statusMap = {
    todo: 'Todo',
    inprogress: 'In Progress',
    done: 'Done'
  };

  const fetchTasks = async () => {
    const res = await axiosInstance.get('/tasks');
    setTasks(res.data);
  };

  const fetchLogs = async () => {
    const res = await axiosInstance.get('/logs');
    setLogs(res.data);
  };

  const fetchUsers = async () => {
    const res = await axiosInstance.get('/users');
    setUsers(res.data);
  };

  useEffect(() => {
    fetchTasks();
    fetchLogs();
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newTask,
        assignedUserId: newTask.assignedUserId ? parseInt(newTask.assignedUserId) : null
      };
      await axiosInstance.post('/tasks', payload);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'Medium', assignedUserId: '' });
      fetchTasks();
      fetchLogs();
      alert('Task created!');
    } catch (err) {
      alert('Error creating task');
      console.error(err);
    }
  };

  const handleSmartAssign = async () => {
    try {
      const payload = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority
      };
      await axiosInstance.post('/tasks/smart-assign', payload);
      alert('Task smart-assigned!');
      setNewTask({ title: '', description: '', status: 'todo', priority: 'Medium', assignedUserId: '' });
      fetchTasks();
      fetchLogs();
    } catch (err) {
      alert('Smart assign failed');
      console.error(err);
    }
  };

  const getTasksByStatus = (status) =>
    tasks.filter((task) => task.status.toLowerCase() === status);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const taskId = parseInt(draggableId);
    try {
      await axiosInstance.put(`/tasks/${taskId}`, {
        status: destination.droppableId
      });
      fetchTasks();
      fetchLogs();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ textAlign: 'center' }}>🚀 Task Dashboard (Safe DnD + Smart Assign + Dropdown)</h2>

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <input type="text" name="title" placeholder="Title" value={newTask.title} onChange={handleInputChange} required />
        <input type="text" name="description" placeholder="Description" value={newTask.description} onChange={handleInputChange} required />

        <select name="status" value={newTask.status} onChange={handleInputChange}>
          {statuses.map((status) => (
            <option key={status} value={status}>{statusMap[status]}</option>
          ))}
        </select>

        <select name="priority" value={newTask.priority} onChange={handleInputChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select name="assignedUserId" value={newTask.assignedUserId} onChange={handleInputChange}>
          <option value="">-- Assign User --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>

        <button type="submit">➕ Create Task</button>
        <button type="button" onClick={handleSmartAssign}>🤖 Smart Assign</button>
      </form>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    width: '30%',
                    minHeight: '300px',
                    padding: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    background: '#f0f0f0'
                  }}
                >
                  <h3 style={{ textAlign: 'center' }}>{statusMap[status]}</h3>
                  {getTasksByStatus(status).map((task, index) => (
                    <Draggable draggableId={task.id.toString()} index={index} key={task.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: '#fff',
                            padding: '0.75rem',
                            marginBottom: '0.75rem',
                            borderRadius: '6px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            ...provided.draggableProps.style
                          }}
                        >
                          <strong>{task.title}</strong>
                          <p>{task.description}</p>
                          <small>Priority: {task.priority}</small><br />
                          <small>Assigned: {task.User?.name || 'None'}</small>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Activity Log */}
      <div style={{ marginTop: '2rem' }}>
        <h3>🕓 Activity Log</h3>
        <ul>
          {logs.map((log) => (
            <li key={log.id}>
              {log.action} — <small>{new Date(log.timestamp).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
