const supabase = require('../config/supabase');

exports.getByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { data, error } = await supabase.from('site_content').select('*').eq('key', key).single();
    if (error) throw error;
    res.json({ success: true, content: data });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('site_content').select('*');
    if (error) throw error;
    res.json({ success: true, content: data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { content } = req.body;
    const { data, error } = await supabase
      .from('site_content')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, content: data });
  } catch (err) { next(err); }
};
