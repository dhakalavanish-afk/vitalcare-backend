const { v4: uuidv4 } = require('uuid');
const supabase = require('../../config/supabase');

// Book a visit
const bookVisit = async (req, res) => {
  try {
    const { memberId, nurseId, scheduledDate, scheduledTime, notes } = req.body;

    // Check nurse availability
    const { data: nurse } = await supabase
      .from('nurses')
      .select('availability_status')
      .eq('nurse_id', nurseId)
      .single();

    if (!nurse || nurse.availability_status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Nurse is not available' });
    }

    const { data: visit, error } = await supabase
      .from('visits')
      .insert({
        visit_id: uuidv4(),
        member_id: memberId,
        nurse_id: nurseId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        notes,
        status: 'Scheduled',
        created_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: 'Visit booked successfully', visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get visits for a member
const getMemberVisits = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('visits')
      .select('*, nurses(user_id, zone), users(full_name)', { count: 'exact' })
      .eq('member_id', memberId)
      .order('scheduled_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data: visits, count, error } = await query;
    if (error) throw error;

    res.json({ success: true, visits, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get visits for a nurse
const getNurseVisits = async (req, res) => {
  try {
    const { nurseId } = req.params;
    const { date, status } = req.query;

    let query = supabase
      .from('visits')
      .select('*, members(member_id, health_score), users(full_name, phone_number)')
      .eq('nurse_id', nurseId)
      .order('scheduled_date', { ascending: true });

    if (date) query = query.eq('scheduled_date', date);
    if (status) query = query.eq('status', status);

    const { data: visits, error } = await query;
    if (error) throw error;

    res.json({ success: true, visits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Complete a visit and record vitals
const completeVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const {
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      oxygenSaturation,
      weight,
      bloodGlucose,
      nurseNotes
    } = req.body;

    // Update visit status
    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .update({
        status: 'Completed',
        completed_at: new Date(),
        nurse_notes: nurseNotes
      })
      .eq('visit_id', visitId)
      .select()
      .single();

    if (visitError) throw visitError;

    // Record vitals
    const { data: vitals, error: vitalsError } = await supabase
      .from('vitals')
      .insert({
        vital_id: uuidv4(),
        visit_id: visitId,
        member_id: visit.member_id,
        blood_pressure_systolic: bloodPressureSystolic,
        blood_pressure_diastolic: bloodPressureDiastolic,
        heart_rate: heartRate,
        temperature,
        oxygen_saturation: oxygenSaturation,
        weight,
        blood_glucose: bloodGlucose,
        recorded_at: new Date()
      })
      .select()
      .single();

    if (vitalsError) throw vitalsError;

    res.json({ success: true, message: 'Visit completed and vitals recorded', visit, vitals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel a visit
const cancelVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabase
      .from('visits')
      .update({ status: 'Cancelled', cancellation_reason: reason })
      .eq('visit_id', visitId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Visit cancelled', visit: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { bookVisit, getMemberVisits, getNurseVisits, completeVisit, cancelVisit };
