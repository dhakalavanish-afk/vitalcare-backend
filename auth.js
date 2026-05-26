const jwt = require('jsonwebtoken');
const supabase = require('../../config/supabase');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from DB
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, email, role_id, is_active')
      .eq('user_id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return async (req, res, next) => {
    const { data: role } = await supabase
      .from('roles')
      .select('role_name')
      .eq('role_id', req.user.role_id)
      .single();

    if (!role || !roles.includes(role.role_name)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    req.userRole = role.role_name;
    next();
  };
};

module.exports = { authenticate, authorize };
