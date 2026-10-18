const supabase = require('../config/supabase');

exports.listByTour = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .eq('tour_id', tourId)
      .order('seat_number');
    if (error) throw error;
    res.json({ success: true, seats: data });
  } catch (err) { next(err); }
};

// Admin: bulk-generate seats for a tour (e.g. 32-seat coaster, 2+2 layout)
exports.generateSeats = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const { total_seats = 32 } = req.body;

    const rows = ['A', 'B', 'C', 'D'];
    const seatsPerRow = 4;
    const numRows = Math.ceil(total_seats / seatsPerRow);
    const seatNumbers = [];
    for (let r = 1; r <= numRows; r++) {
      for (const letter of rows) {
        if (seatNumbers.length >= total_seats) break;
        seatNumbers.push(`${letter}${r}`);
      }
    }

    const seatRecords = seatNumbers.map((seat_number) => ({
      tour_id: tourId,
      seat_number,
      status: 'available',
    }));

    // clear existing seats for this tour first (only if none booked)
    const { data: existingBooked } = await supabase
      .from('seats')
      .select('id')
      .eq('tour_id', tourId)
      .eq('status', 'booked');

    if (existingBooked && existingBooked.length > 0) {
      return res.status(400).json({ success: false, error: 'Cannot regenerate seats: some seats are already booked' });
    }

    await supabase.from('seats').delete().eq('tour_id', tourId);
    const { data, error } = await supabase.from('seats').insert(seatRecords).select();
    if (error) throw error;

    await supabase.from('tours').update({ available_seats: total_seats }).eq('id', tourId);

    res.status(201).json({ success: true, seats: data });
  } catch (err) { next(err); }
};

exports.blockSeat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('seats').update({ status: 'blocked' }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, seat: data });
  } catch (err) { next(err); }
};

exports.unblockSeat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('seats').update({ status: 'available' }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, seat: data });
  } catch (err) { next(err); }
};

// ----- Tour-Date scoped seats (each departure date has its own seat map,
// since the same tour can run multiple times with different coasters) -----

exports.listByTourDate = async (req, res, next) => {
  try {
    const { tourDateId } = req.params;
    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .eq('tour_date_id', tourDateId)
      .order('seat_number');
    if (error) throw error;
    res.json({ success: true, seats: data });
  } catch (err) { next(err); }
};

// Admin: generate seats for a specific departure date. Uses the date's
// assigned vehicle's total_seats if no total_seats is passed explicitly.
exports.generateSeatsForDate = async (req, res, next) => {
  try {
    const { tourDateId } = req.params;
    let { total_seats } = req.body;

    if (!total_seats) {
      const { data: tourDate } = await supabase
        .from('tour_dates')
        .select('vehicle:vehicles(total_seats)')
        .eq('id', tourDateId)
        .single();
      total_seats = tourDate?.vehicle?.total_seats || 32;
    }

    const { data: existingBooked } = await supabase
      .from('seats')
      .select('id')
      .eq('tour_date_id', tourDateId)
      .eq('status', 'booked');

    if (existingBooked && existingBooked.length > 0) {
      return res.status(400).json({ success: false, error: 'Cannot regenerate seats: some seats on this date are already booked' });
    }

    const rows = ['A', 'B', 'C', 'D'];
    const numRows = Math.ceil(total_seats / rows.length);
    const seatNumbers = [];
    for (let r = 1; r <= numRows; r++) {
      for (const letter of rows) {
        if (seatNumbers.length >= total_seats) break;
        seatNumbers.push(`${letter}${r}`);
      }
    }

    await supabase.from('seats').delete().eq('tour_date_id', tourDateId);
    const seatRecords = seatNumbers.map((seat_number) => ({ tour_date_id: tourDateId, seat_number, status: 'available' }));
    const { data, error } = await supabase.from('seats').insert(seatRecords).select();
    if (error) throw error;

    res.status(201).json({ success: true, seats: data });
  } catch (err) { next(err); }
};
