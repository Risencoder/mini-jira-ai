const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Server is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', commentRoutes);

module.exports = app;
