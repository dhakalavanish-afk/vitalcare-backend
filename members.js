const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

router.post('/', async (req, res) => {
  try {
    const { userId, dob, gender, bloodGroup, address, city, state, country, zipCode, emergencyContactName, emergencyContactPhone } = req.body;
    const memberCode = 'VC' + Date.now().toString().slice(-8);
    const { data, error } = await supabase.from('members')
      .insert({ member_id: uuidv4(), user_id: userId, member_code: memberCode, dob, gender, blood_group: bloodGroup, address, city, state, country, zip_code: zipCode, emergency_contact_name: emergencyContactName, emergency_contact_phone: emergencyContactPhone, status: 'Active', created_at: new Date() })
      .select().single();
    if (error) throw error;
    res.status(201).json({ success: true, member: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:memberId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('members').select('*').eq('member_id', req.params.memberId).single();
    if (error) throw error;
    res.json({ success: true, member: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
