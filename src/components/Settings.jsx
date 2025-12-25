import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Sun, Download, User, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion as Motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Settings = ({ user }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  
  const handleSave = (e) => {
    e.preventDefault();
    // Save settings to backend or localStorage (stub)
    localStorage.setItem('userSettings', JSON.stringify({ displayName, notifications, emailDigest }));
    toast.success('Settings saved successfully');
  };

  const handleExport = () => {
    const data = {
      user: { email: user?.email, displayName },
      settings: { isDarkMode, notifications, emailDigest },
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data export started');
  };

  return (
    <div className="settings-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <SettingsIcon size={28} className="text-primary" />
        <div>
          <h1>Settings</h1>
          <p className="text-secondary">Manage your preferences and account</p>
        </div>
      </div>

      <div className="dashboard-widgets" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <Motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} /> Profile Settings
          </h3>
          <form onSubmit={handleSave}>
            <div className="input-group">
              <label className="input-label">Display Name</label>
              <input 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                className="input-field" 
                placeholder="Enter your name"
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input 
                value={user?.email || ''} 
                disabled 
                className="input-field" 
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <small className="text-secondary">Email cannot be changed</small>
            </div>

            <Motion.button 
              type="submit" 
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={16} /> Save Changes
            </Motion.button>
          </form>
        </Motion.div>

        <Motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} /> Preferences
          </h3>
          
          <div className="input-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <label className="input-label" style={{ marginBottom: 0 }}>Dark Mode</label>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Toggle dark theme</p>
            </div>
            <button 
              type="button"
              className={`btn btn-sm ${isDarkMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={toggleTheme}
            >
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>

          <div className="input-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <label className="input-label" style={{ marginBottom: 0 }}>Push Notifications</label>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Get notified about task updates</p>
            </div>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={(e) => setNotifications(e.target.checked)} 
                style={{ width: '1.2rem', height: '1.2rem' }}
              />
            </div>
          </div>

          <div className="input-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label className="input-label" style={{ marginBottom: 0 }}>Email Digest</label>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Receive daily summary</p>
            </div>
             <input 
                type="checkbox" 
                checked={emailDigest} 
                onChange={(e) => setEmailDigest(e.target.checked)}
                style={{ width: '1.2rem', height: '1.2rem' }}
              />
          </div>
        </Motion.div>

        <Motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={20} /> Data Management
          </h3>
          <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
            Download a copy of your settings and local preferences.
          </p>
          <Motion.button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleExport}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={16} /> Export Data
          </Motion.button>
        </Motion.div>
      </div>
    </div>
  );
};

export default Settings;
