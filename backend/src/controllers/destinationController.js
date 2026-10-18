const supabase = require('../config/supabase');

exports.list = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('destinations').select('*').order('title');
    if (error) throw error;
    res.json({ success: true, destinations: data });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('destinations').select('*').eq('id', id).single();
    if (error) throw error;
    const { data: tours } = await supabase.from('tours').select('*').eq('destination_id', id).eq('status', 'active');
    res.json({ success: true, destination: data, tours });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('destinations').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, destination: data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('destinations').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, destination: data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('destinations').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};
