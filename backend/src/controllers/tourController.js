const supabase = require('../config/supabase');

const TOUR_SELECT = `
  *,
  destination:destinations(id, title, image_url),
  duration:tour_durations(id, days, label),
  itineraries:tour_itineraries(id, day_number, title, description)
`;

exports.listTours = async (req, res, next) => {
  try {
    const { destination_id, duration_id, min_price, max_price, available_only, search } = req.query;
    let query = supabase.from('tours').select(TOUR_SELECT).eq('status', 'active');

    if (destination_id) query = query.eq('destination_id', destination_id);
    if (duration_id) query = query.eq('duration_id', duration_id);
    if (min_price) query = query.gte('price', min_price);
    if (max_price) query = query.lte('price', max_price);
    if (available_only === 'true') query = query.gt('available_seats', 0);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // attach pickup points (all active ones, shared across tours) for convenience
    res.json({ success: true, tours: data });
  } catch (err) {
    next(err);
  }
};

exports.getTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('tours').select(TOUR_SELECT).eq('id', id).single();
    if (error) throw error;

    const { data: pickupPoints } = await supabase
      .from('pickup_points')
      .select('*')
      .eq('status', 'active');

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, user:users(name)')
      .eq('tour_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    res.json({ success: true, tour: data, pickup_points: pickupPoints, reviews });
  } catch (err) {
    next(err);
  }
};

// ----- Admin -----
exports.createTour = async (req, res, next) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from('tours').insert(payload).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, tour: data });
  } catch (err) {
    next(err);
  }
};

exports.updateTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('tours').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, tour: data });
  } catch (err) {
    next(err);
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    // soft delete (deactivate) to preserve booking history/integrity
    const { error } = await supabase.from('tours').update({ status: 'inactive' }).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.listToursAdmin = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('tours').select(TOUR_SELECT).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, tours: data });
  } catch (err) {
    next(err);
  }
};

// ----- Itinerary management -----
exports.upsertItineraryDay = async (req, res, next) => {
  try {
    const { tour_id } = req.params;
    const { day_number, title, description, id } = req.body;
    if (id) {
      const { data, error } = await supabase
        .from('tour_itineraries')
        .update({ day_number, title, description })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.json({ success: true, day: data });
    }
    const { data, error } = await supabase
      .from('tour_itineraries')
      .insert({ tour_id, day_number, title, description })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, day: data });
  } catch (err) {
    next(err);
  }
};

exports.deleteItineraryDay = async (req, res, next) => {
  try {
    const { dayId } = req.params;
    const { error } = await supabase.from('tour_itineraries').delete().eq('id', dayId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
