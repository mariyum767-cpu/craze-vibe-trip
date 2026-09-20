const supabase = require('../config/supabase');

exports.listVehicles = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, vehicles: data });
  } catch (err) { next(err); }
};

exports.createVehicle = async (req, res, next) => {
  try {
    const { name, vehicle_number, total_seats, layout } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'name is required' });
    const { data, error } = await supabase.from('vehicles').insert({
      name, vehicle_number, total_seats: Number(total_seats) || 32, layout: layout || '2-2',
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, vehicle: data });
  } catch (err) { next(err); }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('vehicles').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, vehicle: data });
  } catch (err) { next(err); }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    // soft delete to preserve history on any tour_dates that reference it
    const { error } = await supabase.from('vehicles').update({ status: 'inactive' }).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};
