const { v4: uuidv4 } = require('uuid');
const supabase = require('../../config/supabase');

// Create member profile
const createMember = async (req, res) => {
  try {
    const {
      dob, gender, bloodGroup, address, city, state, country, zipCode,
      emergencyContactName, emergencyContactPhone, subscriptionPlanId
    } = req.body;

    // Generate member code
    const memberCode = 'VC' + Date.now().toString().slice(-8);

    const { data: member, error } = await supabase
      .from('members')
      .insert({
        member_id: uuidv4(),
        user_id: req.user.user_id,
        member_code: memberCode,
        dob,
        gender,
        blood_group: bloodGroup,
        address,
        city,
        state,
        country,
        zip_code: zipCode,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        subscription_plan_id: subscriptionPlanId,
        health_score: 0,
        status: 'Active',
        created_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: 'Member profile created', member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get member profile
const getMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const { data: member, error } = await supabase
      .from('members')
      .select(`
        *,
        users(full_name, email, phone_number),
        nurses(user_id, license_number, zone),
        subscription_plans(plan_name, monthly_price, visits_per_month)
      `)
      .eq('member_id', memberId)
      .single();

    if (error || !member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update member profile
const updateMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const updates = req.body;

    const { data: member, error } = await supabase
      .from('members')
      .update({ ...updates, updated_at: new Date() })
      .eq('member_id', memberId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Member updated', member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all members (Admin only)
const getAllMembers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, zone } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('members')
      .select('*, users(full_name, email, phone_number)', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (zone) query = query.eq('nurses.zone', zone);

    const { data: members, count, error } = await query;
    if (error) throw error;

    res.json({ success: true, members, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add family member access
const addFamilyAccess = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { viewerUserId, relationship } = req.body;

    const { data, error } = await supabase
      .from('family_member_access')
      .insert({
        family_access_id: uuidv4(),
        member_id: memberId,
        viewer_user_id: viewerUserId,
        relationship,
        is_active: true,
        created_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: 'Family access granted', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createMember, getMember, updateMember, getAllMembers, addFamilyAccess };
