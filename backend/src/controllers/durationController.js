const supabase = require('../config/supabase');

exports.list = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('tour_durations').select('*').order('days');
    if (error) throw error;
    res.json({ success: true, durations: data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { days, label } = req.body;
    const { data, error } = await supabase.from('tour_durations').insert({ days, label }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, duration: data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('tour_durations').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, duration: data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('tour_durations').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};
