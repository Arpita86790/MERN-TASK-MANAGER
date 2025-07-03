
require('dotenv').config();


const express = require('express');
const cors = require('cors');


const app = express();


app.use(cors());
app.use(express.json());


const sequelize = require('./config/db');


const User = require('./models/User');
const Task = require('./models/Task'); // make sure Task has associations
const ActivityLog = require('./models/ActivityLog');

app.use('/api/users', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/logs', require('./routes/activityRoutes'));


sequelize.sync()
  .then(() => {
    console.log('✅ MySQL DB connected & models synced');
  })
  .catch((err) => {
    console.error('❌ DB connection error:', err);
  });


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
