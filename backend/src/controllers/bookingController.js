const supabase = require('../config/supabase');

exports.createBooking = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const {
      tour_id, tour_date_id, pickup_point_id, seat_ids,
      passenger_name, passenger_phone, passenger_email, cnic,
      number_of_passengers,
    } = req.body;

    if (!tour_id || !tour_date_id || !pickup_point_id || !Array.isArray(seat_ids) || seat_ids.length === 0) {
      return res.status(400).json({ success: false, error: 'tour_id, tour_date_id, pickup_point_id and seat_ids are required' });
    }

    const { data: tour, error: tourErr } = await supabase.from('tours').select('price').eq('id', tour_id).single();
    if (tourErr) throw tourErr;

    const total_price = Number(tour.price) * seat_ids.length;

    const { data, error } = await supabase.rpc('create_booking_with_seats', {
      p_user_id: user_id,
      p_tour_id: tour_id,
      p_tour_date_id: tour_date_id,
      p_pickup_point_id: pickup_point_id,
      p_seat_ids: seat_ids,
      p_passenger_name: passenger_name,
      p_passenger_phone: passenger_phone,
      p_passenger_email: passenger_email,
      p_cnic: cnic || null,
      p_number_of_passengers: number_of_passengers || seat_ids.length,
      p_total_price: total_price,
    });

    if (error) throw error;
    if (!data.success) {
      return res.status(409).json({ success: false, error: data.error === 'one_or_more_seats_unavailable'
        ? 'One or more selected seats were just booked by someone else. Please pick different seats.'
        : data.error });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, tour:tours(title, cover_image), tour_date:tour_dates(start_date), pickup_point:pickup_points(city_name, pickup_time)')
      .eq('id', data.booking_id)
      .single();

    res.status(201).json({ success: true, booking });
  } catch (err) { next(err); }
};

exports.myBookings = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(id, title, cover_image, price),
        tour_date:tour_dates(start_date),
        pickup_point:pickup_points(city_name, pickup_time),
        booking_seats(seat:seats(seat_number))
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, bookings: data });
  } catch (err) { next(err); }
};

exports.getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(id, title, cover_image, price),
        tour_date:tour_dates(start_date),
        pickup_point:pickup_points(city_name, pickup_time),
        booking_seats(seat:seats(seat_number))
      `)
      .eq('id', id)
      .single();
    if (error) throw error;

    if (data.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking: data });
  } catch (err) { next(err); }
};

// ----- Admin -----
exports.listAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(id, title),
        tour_date:tour_dates(start_date),
        pickup_point:pickup_points(city_name),
        user:users(name, email),
        booking_seats(seat:seats(seat_number))
      `);
    if (status) query = query.eq('status', status);
    if (search) query = query.or(`booking_id_string.ilike.%${search}%,passenger_name.ilike.%${search}%,passenger_email.ilike.%${search}%`);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, bookings: data });
  } catch (err) { next(err); }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    // if cancelling, release the seats back to available
    if (status === 'cancelled') {
      const { data: seatLinks } = await supabase.from('booking_seats').select('seat_id').eq('booking_id', id);
      const seatIds = (seatLinks || []).map((s) => s.seat_id);
      if (seatIds.length > 0) {
        await supabase.from('seats').update({ status: 'available' }).in('id', seatIds);
        const { data: booking } = await supabase.from('bookings').select('tour_id').eq('id', id).single();
        if (booking) {
          await supabase.rpc('increment_available_seats', { p_tour_id: booking.tour_id, p_count: seatIds.length }).catch(() => {});
        }
      }
    }

    const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, booking: data });
  } catch (err) { next(err); }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};

// Admin: create a booking manually on behalf of a walk-in / phone customer.
// Same atomic seat-locking RPC as the normal booking flow, so a seat can
// never be double-booked here either — just skips the "logged-in user"
// requirement (user_id is optional).
exports.adminCreateBooking = async (req, res, next) => {
  try {
    const {
      tour_id, tour_date_id, pickup_point_id, seat_ids,
      passenger_name, passenger_phone, passenger_email, cnic,
      number_of_passengers, user_id,
    } = req.body;

    if (!tour_id || !tour_date_id || !pickup_point_id || !Array.isArray(seat_ids) || seat_ids.length === 0 || !passenger_name || !passenger_phone) {
      return res.status(400).json({
        success: false,
        error: 'tour_id, tour_date_id, pickup_point_id, seat_ids, passenger_name and passenger_phone are required',
      });
    }

    const { data: tour, error: tourErr } = await supabase.from('tours').select('price').eq('id', tour_id).single();
    if (tourErr) throw tourErr;

    const total_price = Number(tour.price) * seat_ids.length;

    const { data, error } = await supabase.rpc('create_booking_with_seats', {
      p_user_id: user_id || null,
      p_tour_id: tour_id,
      p_tour_date_id: tour_date_id,
      p_pickup_point_id: pickup_point_id,
      p_seat_ids: seat_ids,
      p_passenger_name: passenger_name,
      p_passenger_phone: passenger_phone,
      p_passenger_email: passenger_email || null,
      p_cnic: cnic || null,
      p_number_of_passengers: number_of_passengers || seat_ids.length,
      p_total_price: total_price,
    });

    if (error) {
      // Most likely cause if this fails: bookings.user_id is NOT NULL in your
      // database. Run this once in the Supabase SQL editor to allow walk-in
      // bookings with no linked account:
      //   ALTER TABLE public.bookings ALTER COLUMN user_id DROP NOT NULL;
      throw error;
    }
    if (!data.success) {
      return res.status(409).json({
        success: false,
        error: data.error === 'one_or_more_seats_unavailable'
          ? 'One or more selected seats were just booked. Please pick different seats.'
          : data.error,
      });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, tour:tours(title, cover_image), tour_date:tour_dates(start_date), pickup_point:pickup_points(city_name, pickup_time)')
      .eq('id', data.booking_id)
      .single();

    res.status(201).json({ success: true, booking });
  } catch (err) { next(err); }
};
