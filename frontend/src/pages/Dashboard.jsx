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

  // 🎨 Inline Styles
  const styles = {
    container: {
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
      fontFamily: 'Poppins, sans-serif',
    },
    title: {
      textAlign: 'center',
      fontSize: '2rem',
      color: '#333',
      marginBottom: '1.5rem',
    },
    formCard: {
      backgroundColor: '#fff',
      padding: '1.5rem',
      borderRadius: '16px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      maxWidth: '1000px',
      margin: '0 auto 2rem auto',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '1rem',
    },
    input: {
      padding: '0.7rem 1rem',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '1rem',
      minWidth: '180px',
    },
    select: {
      padding: '0.7rem 1rem',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '1rem',
      minWidth: '160px',
    },
    button: {
      backgroundColor: '#fcb69f',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '0.8rem 1.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'background 0.3s ease',
    },
    board: {
      display: 'flex',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    column: {
      width: '30%',
      minWidth: '280px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)',
    },
    columnTitle: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '1rem',
      fontSize: '1.2rem',
      fontWeight: '600',
    },
    taskCard: {
      backgroundColor: '#fdfdfd',
      borderRadius: '10px',
      padding: '1rem',
      marginBottom: '0.75rem',
      boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
    },
    logCard: {
      backgroundColor: '#fff',
      padding: '1rem',
      borderRadius: '12px',
      boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)',
      marginTop: '2rem',
      maxWidth: '1000px',
      marginInline: 'auto',
    },
    logList: {
      listStyle: 'none',
      padding: 0,
      color: '#444',
    },
    logItem: {
      padding: '0.4rem 0',
      borderBottom: '1px solid #eee',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚀 Task Dashboard</h2>

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} style={styles.formCard}>
        <input type="text" name="title" placeholder="Title" value={newTask.title} onChange={handleInputChange} required style={styles.input} />
        <input type="text" name="description" placeholder="Description" value={newTask.description} onChange={handleInputChange} required style={styles.input} />

        <select name="status" value={newTask.status} onChange={handleInputChange} style={styles.select}>
          {statuses.map((status) => (
            <option key={status} value={status}>{statusMap[status]}</option>
          ))}
        </select>

        <select name="priority" value={newTask.priority} onChange={handleInputChange} style={styles.select}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select name="assignedUserId" value={newTask.assignedUserId} onChange={handleInputChange} style={styles.select}>
          <option value="">-- Assign User --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>

        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#f7a078')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#fcb69f')}
        >
          ➕ Create Task
        </button>

        <button
          type="button"
          onClick={handleSmartAssign}
          style={styles.button}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#f7a078')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#fcb69f')}
        >
          🤖 Smart Assign
        </button>
      </form>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={styles.board}>
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={styles.column}>
                  <h3 style={styles.columnTitle}>{statusMap[status]}</h3>
                  {getTasksByStatus(status).map((task, index) => (
                    <Draggable draggableId={task.id.toString()} index={index} key={task.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ ...styles.taskCard, ...provided.draggableProps.style }}
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
      <div style={styles.logCard}>
        <h3>🕓 Activity Log</h3>
        <ul style={styles.logList}>
          {logs.map((log) => (
            <li key={log.id} style={styles.logItem}>
              {log.action} — <small>{new Date(log.timestamp).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
