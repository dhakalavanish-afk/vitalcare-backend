const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../../config/supabase');

// Register new user
const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, roleId } = req.body;

    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if email exists
    const { data: existing } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Get default member role if not provided
    let assignedRoleId = roleId;
    if (!assignedRoleId) {
      const { data: memberRole } = await supabase
        .from('roles')
        .select('role_id')
        .eq('role_name', 'Member')
        .single();
      assignedRoleId = memberRole?.role_id;
    }

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        user_id: uuidv4(),
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        password_hash: passwordHash,
        role_id: assignedRoleId,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select('user_id, full_name, email, phone_number, role_id')
      .single();

    if (error) throw error;

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, full_name, email, password_hash, role_id, is_active')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date() })
      .eq('user_id', user.user_id);

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        roleId: user.role_id
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('user_id, full_name, email, phone_number, role_id, created_at')
      .eq('user_id', req.user.user_id)
      .single();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('user_id', req.user.user_id)
      .single();

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await supabase
      .from('users')
      .update({ password_hash: newHash, updated_at: new Date() })
      .eq('user_id', req.user.user_id);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, changePassword };
