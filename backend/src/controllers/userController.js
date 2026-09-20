const supabase = require('../config/supabase');

exports.listUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, users: data });
  } catch (err) { next(err); }
};

exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, created_at')
      .eq('id', id)
      .single();
    if (error) throw error;

    const { data: bookings } = await supabase.from('bookings').select('*').eq('user_id', id);
    res.json({ success: true, user: data, bookings });
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('id, name, email, role')
      .single();
    if (error) throw error;
    res.json({ success: true, user: data });
  } catch (err) { next(err); }
};
