import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, MoreVertical, Plus, Trophy, Target, Zap } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { db } from '../../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

const Team = ({ user }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memberList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(member => !member.isPlaceholder); // Filter out demo/placeholder data
      setMembers(memberList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching team:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    const inviteToast = toast.loading(`Sending invitation to ${inviteEmail}...`);
    try {
      // In a real app, this would send an email or create an invite record in the backend
      // For now, simulate success without adding demo data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      toast.success(`Invitation sent to ${inviteEmail}`, { id: inviteToast });
      setInviteEmail('');
      setShowInvite(false);
    } catch (err) {
      console.error("Error inviting member:", err);
      toast.error("Failed to send invitation", { id: inviteToast });
    }
  };

  if (loading) return (
    <Motion.div 
      className="card" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      style={{ textAlign: 'center', padding: '2rem' }}
    >
      <Zap size={48} className="text-primary" style={{ marginBottom: '1rem' }} />
      Loading your championship team...
    </Motion.div>
  );

  return (
    <div className="team-sprint-view" style={{ 
      background: 'linear-gradient(135deg, var(--background-color) 0%, rgba(59, 130, 246, 0.05) 100%)',
      borderRadius: 'var(--radius-xl)',
      padding: '2rem',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: 'var(--shadow-xl)'
    }}>
      <Motion.div 
        className="sprint-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Trophy size={32} className="text-primary" />
          <div>
            <h1 style={{ 
              background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '2rem',
              fontWeight: 800
            }}>
              Team Sprint: Race to Victory
            </h1>
            <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
              Assemble your elite squad and dominate the project finish line!
            </p>
          </div>
        </div>
        <Motion.button 
          className="btn btn-primary"
          onClick={() => setShowInvite(!showInvite)}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          style={{ 
            background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            padding: '0.75rem 1.5rem',
            fontWeight: 600
          }}
        >
          <Plus size={16} />
          Recruit Champion
        </Motion.button>
      </Motion.div>

      {/* Motivational Team Stats */}
      <Motion.div 
        className="team-stats"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}
      >
        <div className="stat-card" style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.5rem', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Users size={24} className="text-primary" />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{members.length}</h3>
          </div>
          <p className="text-secondary">Elite Team Members</p>
        </div>
        <div className="stat-card" style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.5rem', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Target size={24} className="text-success" />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>85%</h3>
          </div>
          <p className="text-secondary">Sprint Completion</p>
        </div>
        <div className="stat-card" style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.5rem', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Zap size={24} className="text-warning" />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>120h</h3>
          </div>
          <p className="text-secondary">Team Power Hours</p>
        </div>
      </Motion.div>

      {/* Progress Bar for Motivation */}
      <Motion.div 
        className="sprint-progress"
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: '100%' }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: 'var(--radius)', 
          height: '8px', 
          overflow: 'hidden' 
        }}>
          <Motion.div 
            style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--primary-color), var(--success-color))',
              width: '85%' 
            }}
            initial={{ width: 0 }}
            animate={{ width: '85%' }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        </div>
        <p style={{ textAlign: 'center', marginTop: '0.5rem', fontWeight: 600 }}>
          🏁 85% to Victory! Keep pushing, champions!
        </p>
      </Motion.div>

      {showInvite && (
        <Motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{ 
            marginBottom: '2rem', 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px dashed var(--primary-color)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '1.5rem',
            backdropFilter: 'blur(5px)'
          }}
          onSubmit={handleInvite}
        >
          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>Recruit New Champion</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="email" 
                className="input-field" 
                placeholder="champion@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem'
                }}
              />
              <Motion.button 
                type="submit" 
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 600
                }}
              >
                Send Invite
              </Motion.button>
            </div>
          </div>
        </Motion.form>
      )}

      <div className="team-champions">
        <h2 style={{ 
          marginBottom: '1rem', 
          fontSize: '1.5rem', 
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Your Championship Squad
        </h2>
        <div className="team-list" style={{ display: 'grid', gap: '1rem' }}>
          {members.map((member, index) => (
            <Motion.div 
              key={member.id}
              className="champion-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '1.5rem', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  position: 'relative',
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                }}>
                  {(member.displayName || member.email || 'U').charAt(0).toUpperCase()}
                  {member.uid === user.uid && (
                    <div style={{ 
                      position: 'absolute', 
                      top: -5, 
                      right: -5, 
                      background: 'var(--success-color)', 
                      borderRadius: '50%', 
                      width: 20, 
                      height: 20, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}>
                      👑
                    </div>
                  )}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                    {member.displayName || member.email?.split('@')[0]} 
                    {member.uid === user.uid && <span style={{ color: 'var(--primary-color)' }}> (Captain)</span>}
                  </h4>
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
                  background: member.role === 'Owner' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                  color: member.role === 'Owner' ? 'var(--primary-color)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: `1px solid ${member.role === 'Owner' ? 'var(--primary-color)' : 'var(--gray-400)'}`
                }}>
                  {member.role}
                </span>
                <Motion.button 
                  className="btn btn-secondary btn-sm" 
                  style={{ padding: '0.25rem', borderRadius: '50%' }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MoreVertical size={16} />
                </Motion.button>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
