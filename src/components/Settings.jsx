import React, { useState } from 'react';

const Settings = ({ user }) => {
  const [displayName, setDisplayName] = useState(user?.email?.split('@')[0] || '');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

  const handleSave = (e) => {
    e.preventDefault();
    // Save settings to backend or localStorage (stub)
    localStorage.setItem('profile', JSON.stringify({ displayName, timezone }));
    alert('Settings saved');
  };

  return (
    <div className="card">
      <h1>Settings</h1>
      <form onSubmit={handleSave} style={{ marginTop: '1rem' }}>
        <div className="input-group">
          <label className="input-label">Display Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field" />
        </div>

        <div className="input-group">
          <label className="input-label">Timezone</label>
          <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field" />
        </div>

        <div>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
