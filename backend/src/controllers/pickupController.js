const supabase = require('../config/supabase');

exports.list = async (req, res, next) => {
  try {
    const activeOnly = req.query.active_only !== 'false';
    let query = supabase.from('pickup_points').select('*');
    if (activeOnly) query = query.eq('status', 'active');
    const { data, error } = await query.order('city_name');
    if (error) throw error;
    res.json({ success: true, pickup_points: data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('pickup_points').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, pickup_point: data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('pickup_points').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, pickup_point: data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    // soft-disable rather than hard delete, to preserve booking history
    const { error } = await supabase.from('pickup_points').update({ status: 'inactive' }).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};
