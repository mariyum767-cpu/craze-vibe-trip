const supabase = require('../config/supabase');

exports.list = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = supabase.from('faqs').select('*');
    if (category) query = query.eq('category', category);
    const { data, error } = await query.order('order_index');
    if (error) throw error;
    res.json({ success: true, faqs: data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('faqs').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, faq: data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('faqs').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, faq: data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};
