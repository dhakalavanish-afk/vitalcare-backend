const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

router.post('/', async (req, res) => {
  try {
    const { memberId, nurseId, scheduledDate, scheduledTime, notes } = req.body;
    const { data, error } = await supabase.from('visits')
      .insert({ visit_id: uuidv4(), member_id: memberId, nurse_id: nurseId, scheduled_date: scheduledDate, scheduled_time: scheduledTime, notes, status: 'Scheduled', created_at: new Date() })
      .select().single();
    if (error) throw error;
    res.status(201).json({ success: true, visit: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/member/:memberId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('visits').select('*').eq('member_id', req.params.memberId).order('scheduled_date', { ascending: false });
    if (error) throw error;
    res.json({ success: true, visits: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:visitId/complete', async (req, res) => {
  try {
    const { nurseNotes, bloodPressureSystolic, bloodPressureDiastolic, heartRate, temperature, oxygenSaturation, weight } = req.body;
    const { data: visit, error } = await supabase.from('visits').update({ status: 'Completed', nurse_notes: nurseNotes, completed_at: new Date() }).eq('visit_id', req.params.visitId).select().single();
    if (error) throw error;
    await supabase.from('vitals').insert({ vital_id: uuidv4(), visit_id: req.params.visitId, member_id: visit.member_id, blood_pressure_systolic: bloodPressureSystolic, blood_pressure_diastolic: bloodPressureDiastolic, heart_rate: heartRate, temperature, oxygen_saturation: oxygenSaturation, weight, recorded_at: new Date() });
    res.json({ success: true, visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
