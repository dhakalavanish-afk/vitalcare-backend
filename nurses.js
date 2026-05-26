const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

router.post('/', async (req, res) => {
  try {
    const { userId, licenseNumber, certification, zone, payRate } = req.body;
    const { data, error } = await supabase.from('nurses')
      .insert({ nurse_id: uuidv4(), user_id: userId, license_number: licenseNumber, certification, zone, pay_rate: payRate, availability_status: 'Available', is_active: true, created_at: new Date() })
      .select().single();
    if (error) throw error;
    res.status(201).json({ success: true, nurse: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('nurses').select('*').eq('is_active', true);
    if (error) throw error;
    res.json({ success: true, nurses: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:nurseId/availability', async (req, res) => {
  try {
    const { availabilityStatus } = req.body;
    const { data, error } = await supabase.from('nurses').update({ availability_status: availabilityStatus }).eq('nurse_id', req.params.nurseId).select().single();
    if (error) throw error;
    res.json({ success: true, nurse: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
