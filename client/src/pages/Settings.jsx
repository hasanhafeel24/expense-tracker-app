import { useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { User, Globe, Lock, Save } from 'lucide-react';

const CURRENCIES = [
  { value: 'USD', label: '🇺🇸 USD — US Dollar' },
  { value: 'EUR', label: '🇪🇺 EUR — Euro' },
  { value: 'GBP', label: '🇬🇧 GBP — British Pound' },
  { value: 'INR', label: '🇮🇳 INR — Indian Rupee' },
  { value: 'JPY', label: '🇯🇵 JPY — Japanese Yen' },
  { value: 'AUD', label: '🇦🇺 AUD — Australian Dollar' },
  { value: 'CAD', label: '🇨🇦 CAD — Canadian Dollar' },
  { value: 'CHF', label: '🇨🇭 CHF — Swiss Franc' },
  { value: 'CNY', label: '🇨🇳 CNY — Chinese Yuan' },
];

export default function Settings() {
  const { user, updateProfile } = useAuthStore();
  const [profile, setProfile] = useState({ name: user?.name || '', currency: user?.currency || 'USD', monthlyBudget: user?.monthlyBudget || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile(profile);
    setSaving(false);
    if (result.success) toast.success('Profile updated!');
    else toast.error(result.message || 'Update failed');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {/* Profile Card */}
        <div className="card mb-20">
          <div className="flex items-center gap-16" style={{ marginBottom: '24px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--teal), var(--purple-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '20px' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <User size={16} color="var(--teal)" />
            <h3 style={{ fontWeight: 600 }}>Profile Information</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder="Your name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" value={user?.email || ''} disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email cannot be changed</span>
          </div>
        </div>

        {/* Preferences */}
        <div className="card mb-20">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Globe size={16} color="var(--purple-light)" />
            <h3 style={{ fontWeight: 600 }}>Preferences</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Default Currency</label>
            <select className="form-control" value={profile.currency}
              onChange={(e) => setProfile((p) => ({ ...p, currency: e.target.value }))}>
              {CURRENCIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Monthly Budget Goal ({profile.currency})</label>
            <input className="form-control" type="number" step="0.01"
              value={profile.monthlyBudget}
              onChange={(e) => setProfile((p) => ({ ...p, monthlyBudget: e.target.value }))}
              placeholder="Enter your monthly budget goal" />
          </div>
        </div>

        {/* Account Info */}
        <div className="card mb-20">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Lock size={16} color="var(--gold)" />
            <h3 style={{ fontWeight: 600 }}>Account Information</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Account Status', value: user?.isActive ? '✅ Active' : '❌ Inactive' },
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
              { label: 'Currency', value: user?.currency || 'USD' },
              { label: 'User ID', value: `...${user?._id?.slice(-8) || ''}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg w-full" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
