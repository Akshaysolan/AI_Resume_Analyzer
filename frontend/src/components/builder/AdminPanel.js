import React, { useState, useEffect } from 'react';
import { Shield, Crown, RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { adminGetUsers, adminGrant, adminRevoke } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AdminPanel.css';

const AdminPanel = ({ onClose }) => {
  const { user }          = useAuth();
  const [tab, setTab]     = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grantEmail, setGrantEmail] = useState('');
  const [msg, setMsg]     = useState({ text: '', type: '' });

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await adminGetUsers();
      setUsers(r.data.users || []);
    } catch (e) {
      showMsg(e?.response?.data?.error || 'Failed to load users.', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGrant = async () => {
    if (!grantEmail.trim()) return;
    try {
      const r = await adminGrant(grantEmail.trim());
      showMsg(r.data.message || 'Pro access granted!');
      setGrantEmail('');
      fetchUsers();
    } catch (e) {
      showMsg(e?.response?.data?.error || 'Failed to grant.', 'error');
    }
  };

  const handleRevoke = async (email) => {
    try {
      const r = await adminRevoke(email);
      showMsg(r.data.message || 'Subscription revoked.');
      fetchUsers();
    } catch (e) {
      showMsg(e?.response?.data?.error || 'Failed to revoke.', 'error');
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-panel glass-card">
        <div className="admin-header">
          <div className="admin-header-left">
            <Shield size={20} className="admin-icon" />
            <h2>Admin Panel</h2>
            <span className="admin-badge">Admin: {user?.name}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>← Back</button>
        </div>

        <div className="admin-tabs">
          {[['users', 'Users'], ['grant', 'Grant / Revoke']].map(([id, label]) => (
            <button key={id} className={`admin-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {msg.text && (
          <div className={`admin-msg ${msg.type === 'error' ? 'error' : ''}`}>
            {msg.type === 'error' ? <XCircle size={15} /> : <CheckCircle size={15} />}
            {msg.text}
          </div>
        )}

        {tab === 'users' && (
          <div className="admin-users">
            <div className="admin-users-header">
              <span className="admin-users-count">{users.length} registered users</span>
              <button className="btn btn-ghost btn-xs" onClick={fetchUsers}><RefreshCw size={13} /> Refresh</button>
            </div>
            {loading ? (
              <div className="admin-loading"><Loader2 size={24} className="spin" /></div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Plan</th>
                      <th>Downloads</th><th>Resumes</th><th>Joined</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i}>
                        <td className="font-medium">{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          {u.is_admin
                            ? <span className="badge badge-admin">Admin</span>
                            : u.is_subscribed
                            ? <span className="badge badge-pro"><Crown size={10} /> Pro</span>
                            : <span className="badge badge-free">Free</span>}
                        </td>
                        <td className="text-center">{u.downloads_used}</td>
                        <td className="text-center">{u.resumes_built}</td>
                        <td className="text-muted">{u.created_at}</td>
                        <td>
                          {!u.is_admin && (
                            u.is_subscribed
                              ? <button className="tbl-btn revoke" onClick={() => handleRevoke(u.email)}>Revoke</button>
                              : <button className="tbl-btn grant"  onClick={() => handleGrant(u.email) || setGrantEmail(u.email) || handleGrant()}>Grant</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'grant' && (
          <div className="admin-grant">
            <p className="admin-grant-info">Enter a user's email to grant or revoke their Pro subscription.</p>
            <div className="admin-grant-form">
              <input
                className="form-input"
                type="email"
                placeholder="user@example.com"
                value={grantEmail}
                onChange={e => setGrantEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGrant()}
              />
              <button className="btn btn-primary" onClick={handleGrant}>
                <Crown size={14} /> Grant Pro
              </button>
              <button className="btn btn-outline" onClick={async () => {
                if (!grantEmail.trim()) return;
                try { const r = await adminRevoke(grantEmail.trim()); showMsg(r.data.message); setGrantEmail(''); fetchUsers(); }
                catch (e) { showMsg(e?.response?.data?.error || 'Failed', 'error'); }
              }}>
                <XCircle size={14} /> Revoke
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
