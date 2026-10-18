'use client';
import { useState } from 'react';
import { uploadImage } from '@/lib/api';

// Drop-in replacement for a plain "paste image URL" input: shows the current
// image, a file picker that uploads to Supabase Storage, AND still lets you
// paste a URL directly if you prefer. Calls onChange(url) either way.
export default function ImageUploadField({ label = 'Image', value, onChange, folder = 'general' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="w-full h-32 object-cover rounded-lg mb-2 border" />
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Paste an image URL, or upload a file →"
          className="input flex-1"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className="btn-secondary text-center cursor-pointer whitespace-nowrap">
          {uploading ? 'Uploading...' : 'Upload File'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
