import React, { useState } from 'react';
import { Users, Mail, Shield, MoreVertical, Plus } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Team = ({ user }) => {
  const [members, setMembers] = useState([
    { id: 1, name: user?.displayName || user?.email?.split('@')[0] || 'You', email: user?.email, role: 'Owner', avatar: null },
    { id: 2, name: 'Alex Johnson', email: 'alex@example.com', role: 'Editor', avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=random' },
    { id: 3, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Viewer', avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=random' },
  ]);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    // Mock invite
    toast.success(`Invitation sent to ${inviteEmail}`);
    setMembers([...members, {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'Viewer',
      avatar: `https://ui-avatars.com/api/?name=${inviteEmail}&background=random`
    }]);
    setInviteEmail('');
    setShowInvite(false);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Users size={28} className="text-primary" />
          <div>
            <h1>Team Members</h1>
            <p className="text-secondary">Manage your team and permissions</p>
          </div>
        </div>
        <Motion.button 
          className="btn btn-primary"
          onClick={() => setShowInvite(!showInvite)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} />
          Invite Member
        </Motion.button>
      </div>

      {showInvite && (
        <Motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ marginBottom: '2rem', border: '1px dashed var(--primary-color)' }}
          onSubmit={handleInvite}
        >
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="email" 
                className="input-field" 
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">Send Invite</button>
            </div>
          </div>
        </Motion.form>
      )}

      <div className="team-list">
        {members.map(member => (
          <Motion.div 
            key={member.id}
            className="activity-item" // Reusing styling
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginBottom: '1rem', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} style={{ width: 40, height: 40, borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 style={{ margin: 0 }}>{member.name} {member.id === 1 && '(You)'}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Mail size={12} />
                  {member.email}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={`badge ${member.role === 'Owner' ? 'badge-primary' : 'badge-secondary'}`} style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '2rem', 
                background: member.role === 'Owner' ? 'var(--primary-100)' : 'var(--gray-100)',
                color: member.role === 'Owner' ? 'var(--primary-700)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {member.role}
              </span>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                <MoreVertical size={16} />
              </button>
            </div>
          </Motion.div>
        ))}
      </div>
    </div>
  );
};

export default Team;
