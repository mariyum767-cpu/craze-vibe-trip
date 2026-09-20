const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cvt_token');
}

async function request(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (auth) {
    const token = getToken();
    if (token) opts.headers.Authorization = `Bearer ${token}`;
  }
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${path}`, opts);
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export function saveToken(token) {
  if (typeof window !== 'undefined') localStorage.setItem('cvt_token', token);
}
export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('cvt_token');
}
export { getToken };

// Multipart upload (bypasses the JSON-only `request()` helper above)
export async function uploadImage(file, folder = 'general') {
  const token = getToken();
  const form = new FormData();
  form.append('image', file);
  form.append('folder', folder);

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }
  return data.url;
}
