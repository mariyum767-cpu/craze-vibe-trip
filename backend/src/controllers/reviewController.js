const supabase = require('../config/supabase');

// Public: all approved reviews across every tour, for the standalone Reviews page
exports.listApprovedReviews = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, tour:tours(id, title), user:users(name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, reviews: data });
  } catch (err) { next(err); }
};

exports.submitReview = async (req, res, next) => {
  try {
    const { tour_id, rating, comment } = req.body;
    if (!tour_id || !rating) {
      return res.status(400).json({ success: false, error: 'tour_id and rating are required' });
    }
    const { data, error } = await supabase
      .from('reviews')
      .insert({ user_id: req.user.id, tour_id, rating, comment, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, review: data });
  } catch (err) { next(err); }
};

exports.myReviews = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, tour:tours(title)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, reviews: data });
  } catch (err) { next(err); }
};

// ----- Admin -----
exports.listAllReviews = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = supabase.from('reviews').select('*, tour:tours(title), user:users(name, email)');
    if (status) query = query.eq('status', status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, reviews: data });
  } catch (err) { next(err); }
};

exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const { data, error } = await supabase.from('reviews').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, review: data });
  } catch (err) { next(err); }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};
