import React, { useState, useEffect, Suspense } from 'react'
import { auth, db } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { Toaster } from 'react-hot-toast'
import { Sun, Moon, LogOut, User } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

// Lazy-loaded feature pages (code splitting)
const Team = React.lazy(() => import('./components/Team'));
const TimeTracking = React.lazy(() => import('./components/TimeTracking'));
const Analytics = React.lazy(() => import('./components/Analytics'));
const Settings = React.lazy(() => import('./components/Settings'));


import Auth from './components/Auth'
import TaskManager from './components/TaskManager'
import Dashboard from './components/Dashboard'
import Calendar from './components/Calendar'
import Projects from './components/Projects'
import Sidebar from './components/Sidebar'
import { ThemeProvider, useTheme } from './context/ThemeContext'

import './App.css'
import './styles/modern.css'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <Motion.button 
      onClick={toggleTheme} 
      className="btn btn-secondary btn-sm"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
      {isDarkMode ? 'Light' : 'Dark'}
    </Motion.button>
  );
};

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-mode' : '';
  }, [isDarkMode]);

  // Subscribe to tasks when there's an authenticated user
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(taskList);
    }, (err) => {
      console.error('Error fetching tasks:', err);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) return (
    <div className="loading-screen">
      <motion.div
        className="loading-spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        ⚡
      </motion.div>
      <p>Loading TaskFlow Pro...</p>
    </div>
  );

  if (!user) {
    return (
      <div className="auth-container">
        <Auth />
        <Toaster position="top-right" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard tasks={tasks} user={user} />;
      case 'tasks':
        return <TaskManager user={user} />;
      case 'calendar':
        return <Calendar tasks={tasks} />;
      case 'projects':
        return <Projects tasks={tasks} />;
      case 'team':
        return (
          <Suspense fallback={<div className="card">Loading Team...</div>}>
            <Team tasks={tasks} user={user} />
          </Suspense>
        );
      case 'timetrack':
        return (
          <Suspense fallback={<div className="card">Loading Time Tracking...</div>}>
            <TimeTracking tasks={tasks} user={user} />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<div className="card">Loading Analytics...</div>}>
            <Analytics tasks={tasks} />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<div className="card">Loading Settings...</div>}>
            <Settings user={user} />
          </Suspense>
        );
      default:
        return <Dashboard tasks={tasks} user={user} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>TaskFlow Pro</h1>
          </div>
          
          <div className="header-right">
            <ThemeToggle />
            
            <div className="user-menu">
              <div className="user-info">
                <User size={16} />
                <span>{user.email?.split('@')[0]}</span>
              </div>
              
              <motion.button 
                onClick={handleSignOut} 
                className="btn btn-secondary btn-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={16} />
                Sign Out
              </motion.button>
            </div>
          </div>
        </header>
        
        <main className="content-area">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--surface-color)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App
