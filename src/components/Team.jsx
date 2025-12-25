import React from 'react';
import { Users } from 'lucide-react';

const Team = ({ tasks = [], user }) => {
  // Minimal initial implementation; can be extended later
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Users size={28} />
        <div>
          <h1>Team</h1>
          <p>Collaborate with teammates and manage roles and permissions.</p>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <p className="coming-soon">Signed-in as <strong>{user?.email || '—'}</strong> • {tasks.length} tasks in your account.</p>
        <p style={{ marginTop: '0.75rem' }}>Team features are coming soon — you can create projects and invite collaborators via your hosting provider.</p>
      </div>
    </div>
  );
};

export default Team;
