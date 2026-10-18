const supabase = require('../config/supabase');

exports.dashboardStats = async (req, res, next) => {
  try {
    const [
      totalTours, activeTours, totalBookings, confirmedBookings,
      pendingBookings, totalUsers, seatsAll,
    ] = await Promise.all([
      supabase.from('tours').select('id', { count: 'exact', head: true }),
      supabase.from('tours').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('seats').select('status'),
    ]);

    const seats = seatsAll.data || [];
    const availableSeats = seats.filter((s) => s.status === 'available').length;
    const bookedSeats = seats.filter((s) => s.status === 'booked').length;

    res.json({
      success: true,
      stats: {
        total_tours: totalTours.count || 0,
        active_tours: activeTours.count || 0,
        total_bookings: totalBookings.count || 0,
        confirmed_bookings: confirmedBookings.count || 0,
        pending_bookings: pendingBookings.count || 0,
        total_users: totalUsers.count || 0,
        available_seats: availableSeats,
        booked_seats: bookedSeats,
      },
    });
  } catch (err) { next(err); }
};
