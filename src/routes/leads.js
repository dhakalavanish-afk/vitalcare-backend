const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.post('/', async (req, res) => {
try {
const { name, email, phone, address, plan, careFor, visitTime, conditions } = req.body;

const { data, error } = await supabase
.from('leads')
.insert([{
name,
email,
phone,
address,
plan,
care_for: careFor,
visit_time: visitTime,
conditions
}]);

if (error) throw error;

res.status(201).json({ success: true, message: 'Lead saved successfully' });
} catch (error) {
console.error('Lead error:', error);
res.status(500).json({ success: false, message: error.message });
}
});

module.exports = router;
