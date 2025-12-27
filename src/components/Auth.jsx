import { useState } from 'react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'Email is already in use.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/operation-not-allowed':
        return 'Operation not allowed.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/missing-password':
        return 'Password is required.';
      default:
        // Log the unknown error code for debugging purposes
        console.error('Unknown Auth Error:', errorCode);
        return 'Invalid email or password.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: Date.now(),
          displayName: email.split('@')[0],
          role: 'Owner',
          settings: {
            notifications: true,
            emailDigest: false,
            theme: 'light'
          }
        });
      }
    } catch (err) {
      const message = getFriendlyErrorMessage(err.code);
      toast.error(message);
    }
  };

  return (
    <div className="auth-wrapper">
      <motion.div 
        className="card auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          <motion.h2 
            key={isLogin ? 'login' : 'signup'}
            className="auth-title"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </motion.h2>
        </AnimatePresence>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <motion.button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </motion.button>
        </form>
        <div style={{ textAlign: 'center' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setIsLogin(!isLogin)}
            style={{ border: 'none' }}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
