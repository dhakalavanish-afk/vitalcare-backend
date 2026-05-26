require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./auth');
const memberRoutes = require('./members');
const nurseRoutes = require('./nurses');
const subscriptionRoutes = require('./subscriptions');
const visitRoutes = require('./visits');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/visits', visitRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'VitalCare API is running', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`VitalCare API running on port ${PORT}`));

module.exports = app;
