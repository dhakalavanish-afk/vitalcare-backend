
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    const memberRoleId = '770893df-1325-473a-bde9-65d4b98e110e';
    const { data: user, error } = await supabase
      .from('users')
      .insert({ user_id: uuidv4(), full_name: fullName, email, phone_number: phoneNumber, password_hash: passwordHash, role_id: memberRoleId, is_active: true, created_at: new Date() })
      .select('user_id, full_name, email, role_id').single();
    if (error) throw error;
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { userId: user.user_id, fullName: user.full_name, email: user.email, roleId: user.role_id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { userId: user.user_id, fullName: user.full_name, email: user.email, roleId: user.role_id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/health', (req, res) => res.json({ status: 'VitalCare API running' }));
module.exports = router;
