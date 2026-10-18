const supabase = require('../config/supabase');

exports.listByTour = async (req, res, next) => {
  try {
    const { tour_id } = req.params;
    const { data, error } = await supabase
      .from('tour_dates')
      .select('*, vehicle:vehicles(id, name, total_seats, layout)')
      .eq('tour_id', tour_id)
      .order('start_date');
    if (error) throw error;
    res.json({ success: true, tour_dates: data });
  } catch (err) { next(err); }
};

exports.createTourDate = async (req, res, next) => {
  try {
    const { tour_id } = req.params;
    const { start_date, vehicle_id } = req.body;
    if (!start_date) return res.status(400).json({ success: false, error: 'start_date is required' });
    const { data, error } = await supabase
      .from('tour_dates')
      .insert({ tour_id, start_date, vehicle_id: vehicle_id || null })
      .select('*, vehicle:vehicles(id, name, total_seats, layout)')
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, tour_date: data });
  } catch (err) { next(err); }
};

exports.updateTourDate = async (req, res, next) => {
  try {
    const { dateId } = req.params;
    const { data, error } = await supabase.from('tour_dates').update(req.body).eq('id', dateId).select().single();
    if (error) throw error;
    res.json({ success: true, tour_date: data });
  } catch (err) { next(err); }
};

exports.deleteTourDate = async (req, res, next) => {
  try {
    const { dateId } = req.params;
    const { error } = await supabase.from('tour_dates').delete().eq('id', dateId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};
