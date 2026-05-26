const { v4: uuidv4 } = require('uuid');
const supabase = require('../../config/supabase');

// Create nurse profile
const createNurse = async (req, res) => {
  try {
    const { licenseNumber, certification, zone, payRate } = req.body;

    const { data: nurse, error } = await supabase
      .from('nurses')
      .insert({
        nurse_id: uuidv4(),
        user_id: req.user.user_id,
        license_number: licenseNumber,
        certification,
        zone,
        rating: 0,
        pay_rate: payRate,
        availability_status: 'Available',
        is_active: true,
        created_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: 'Nurse profile created', nurse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all nurses
const getAllNurses = async (req, res) => {
  try {
    const { zone, availabilityStatus, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('nurses')
      .select('*, users(full_name, email, phone_number)', { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + limit - 1);

    if (zone) query = query.eq('zone', zone);
    if (availabilityStatus) query = query.eq('availability_status', availabilityStatus);

    const { data: nurses, count, error } = await query;
    if (error) throw error;

    res.json({ success: true, nurses, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get nurse by ID
const getNurse = async (req, res) => {
  try {
    const { nurseId } = req.params;

    const { data: nurse, error } = await supabase
      .from('nurses')
      .select('*, users(full_name, email, phone_number)')
      .eq('nurse_id', nurseId)
      .single();

    if (error || !nurse) {
      return res.status(404).json({ success: false, message: 'Nurse not found' });
    }

    res.json({ success: true, nurse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update nurse availability
const updateAvailability = async (req, res) => {
  try {
    const { nurseId } = req.params;
    const { availabilityStatus } = req.body;

    const validStatuses = ['Available', 'Busy', 'Off Duty', 'On Leave'];
    if (!validStatuses.includes(availabilityStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid availability status' });
    }

    const { data, error } = await supabase
      .from('nurses')
      .update({ availability_status: availabilityStatus })
      .eq('nurse_id', nurseId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Availability updated', nurse: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Assign nurse to member
const assignNurseToMember = async (req, res) => {
  try {
    const { memberId, nurseId } = req.body;

    const { data, error } = await supabase
      .from('members')
      .update({ assigned_nurse_id: nurseId })
      .eq('member_id', memberId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Nurse assigned successfully', member: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createNurse, getAllNurses, getNurse, updateAvailability, assignNurseToMember };
