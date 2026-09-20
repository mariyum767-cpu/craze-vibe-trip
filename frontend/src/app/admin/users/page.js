'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  function load() { api.get('/users', { auth: true }).then((d) => setUsers(d.users || [])).catch(() => {}); }
  useEffect(load, []);

  async function toggleRole(u) {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
    await api.put(`/users/${u.id}/role`, { role: newRole }, { auth: true });
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-6">Registered Users</h1>
      <div className="card divide-y">
        {users.map((u) => (
          <div key={u.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-forest-dark">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email} · {u.phone || 'No phone'}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
              <button onClick={() => toggleRole(u)} className="text-sm text-forest hover:underline">
                Make {u.role === 'admin' ? 'User' : 'Admin'}
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="p-4 text-gray-500">No users yet.</p>}
      </div>
    </div>
  );
}
