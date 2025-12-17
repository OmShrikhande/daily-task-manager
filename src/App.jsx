import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Auth from './components/Auth'
import TaskManager from './components/TaskManager'
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Loading...
    </div>
  );

  return (
    <div className="App">
      <header className="header">
        <h1>Internship Task Manager</h1>
        {user && (
          <div className="user-info">
            <span>{user.email}</span>
            <button onClick={handleSignOut} className="btn btn-secondary btn-sm">Sign Out</button>
          </div>
        )}
      </header>
      <main className="app-container">
        {user ? <TaskManager /> : <Auth />}
      </main>
    </div>
  )
}

export default App
