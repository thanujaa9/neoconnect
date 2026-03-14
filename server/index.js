const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const runEscalation = require('./jobs/escalation');

const app = express();

/* -------------------- MIDDLEWARE -------------------- */

app.use(cors()); // better than manual headers
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* -------------------- ROUTES -------------------- */

app.get('/', (req, res) => {
  res.json({ message: 'NeoConnect API running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/polls', require('./routes/polls'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/hub', require('./routes/hub'));
/* -------------------- DATABASE -------------------- */

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    // Start background jobs AFTER DB connection
    runEscalation();

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });

  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
  });