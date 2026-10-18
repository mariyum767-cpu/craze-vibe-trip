const multer = require('multer');
const supabase = require('../config/supabase');

// Keep the file in memory, then stream it straight to Supabase Storage —
// no temp files on disk.
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

exports.uploadMiddleware = upload.single('image');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'images';

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided (field name must be "image")' });
    }

    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const folder = req.body.folder && /^[a-z0-9_-]+$/i.test(req.body.folder) ? req.body.folder : 'general';
    const path = `${folder}/${filename}`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

    if (uploadErr) {
      // Most common cause: the "images" bucket doesn't exist yet in Supabase Storage.
      if (/bucket.*not.*found/i.test(uploadErr.message)) {
        return res.status(500).json({
          success: false,
          error: `Storage bucket "${BUCKET}" not found. In Supabase Dashboard → Storage, create a PUBLIC bucket named "${BUCKET}", then try again.`,
        });
      }
      throw uploadErr;
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    res.status(201).json({ success: true, url: publicUrlData.publicUrl, path });
  } catch (err) { next(err); }
};
