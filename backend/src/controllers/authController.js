const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../config/supabase');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Sends the reset email if SMTP is configured (SMTP_HOST/SMTP_USER/SMTP_PASS
// in .env); otherwise logs it and returns the link directly in the API
// response, so the flow is fully testable even with no email service set up.
async function sendResetEmail(email, resetUrl) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[password reset] No SMTP configured — reset link for ${email}: ${resetUrl}`);
    return false;
  }
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Reset your Craze Vibes Trips password',
      html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
    return true;
  } catch (err) {
    console.error('[password reset] Email send failed:', err.message);
    return false;
  }
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'name, email and password are required' });
    }

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert({ name, email, password_hash, phone, role: 'user' })
      .select('id, name, email, phone, role, created_at')
      .single();

    if (error) throw error;

    const token = signToken(data);
    res.status(201).json({ success: true, token, user: data });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, created_at')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const { data, error } = await supabase
      .from('users')
      .update({ name, phone })
      .eq('id', req.user.id)
      .select('id, name, email, phone, role, created_at')
      .single();
    if (error) throw error;
    res.json({ success: true, user: data });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });

    const { data: user } = await supabase.from('users').select('id, email').eq('email', email).maybeSingle();

    // Always respond the same way whether or not the email exists, so this
    // endpoint can't be used to check which emails are registered.
    const genericResponse = { success: true, message: 'If that email is registered, a reset link has been sent.' };

    if (!user) return res.json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await supabase.from('users').update({ reset_token_hash: tokenHash, reset_token_expires: expires }).eq('id', user.id);

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;
    const emailed = await sendResetEmail(user.email, resetUrl);

    // Dev convenience: if no SMTP is configured, hand back the link directly
    // so the flow is testable without a real mail server.
    res.json(emailed ? genericResponse : { ...genericResponse, devResetUrl: resetUrl });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, error: 'token and password are required' });
    if (password.length < 6) return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { data: user } = await supabase
      .from('users')
      .select('id, reset_token_expires')
      .eq('reset_token_hash', tokenHash)
      .maybeSingle();

    if (!user || !user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ success: false, error: 'This reset link is invalid or has expired. Please request a new one.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await supabase.from('users').update({ password_hash, reset_token_hash: null, reset_token_expires: null }).eq('id', user.id);

    res.json({ success: true, message: 'Password updated — you can now log in.' });
  } catch (err) {
    next(err);
  }
};
