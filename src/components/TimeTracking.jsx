/* eslint-disable react-hooks/purity */
import React, { useState, useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, RotateCcw, Save, History } from 'lucide-react';
import toast from 'react-hot-toast';

const TimeTracking = ({ tasks = [], user }) => {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [logs, setLogs] = useState([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Load logs from local storage
    const savedLogs = localStorage.getItem(`timeLogs_${user?.uid}`);
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, [user]);

  const saveLogs = (newLogs) => {
    setLogs(newLogs);
    localStorage.setItem(`timeLogs_${user?.uid}`, JSON.stringify(newLogs));
  };

  const start = () => {
    if (!selectedTaskId) {
      toast.error('Please select a task first');
      return;
    }
    if (running) return;
    
    setRunning(true);
    startTimeRef.current = Date.now() - elapsed;
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 1000);
  };

  const stop = () => {
    if (!running) return;
    setRunning(false);
    clearInterval(timerRef.current);
  };

  const reset = () => {
    stop();
    setElapsed(0);
  };

  const saveSession = () => {
    if (elapsed < 1000) {
      toast.error('Time session too short to save');
      return;
    }
    
    const task = tasks.find(t => t.id === selectedTaskId);
    const newLog = {
      id: Date.now(),
      taskId: selectedTaskId,
      taskTitle: task ? task.content : 'Unknown Task',
      duration: elapsed,
      date: new Date().toISOString()
    };
    
    const newLogs = [newLog, ...logs];
    saveLogs(newLogs);
    
    reset();
    toast.success('Time log saved!');
  };

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="time-tracking">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Clock size={28} className="text-primary" />
          <div>
            <h1>Time Tracking</h1>
            <p className="text-secondary">Track time spent on your tasks</p>
          </div>
        </div>

        <div className="timer-container" style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ marginBottom: '2rem' }}>
            <select 
              className="input-field" 
              style={{ maxWidth: '400px', margin: '0 auto' }}
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              disabled={running}
            >
              <option value="">Select a task to track...</option>
              {tasks.filter(t => t.status !== 'completed').map(task => (
                <option key={task.id} value={task.id}>{task.content}</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '4rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary-color)', marginBottom: '2rem' }}>
            {formatTime(elapsed)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {!running ? (
              <Motion.button 
                className="btn btn-primary" 
                onClick={start}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: '0.75rem 2rem', fontSize: '1.25rem' }}
              >
                <Play size={24} /> Start
              </Motion.button>
            ) : (
              <Motion.button 
                className="btn btn-warning" 
                onClick={stop}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: '0.75rem 2rem', fontSize: '1.25rem', backgroundColor: 'var(--warning-color)', color: 'white' }}
              >
                <Pause size={24} /> Pause
              </Motion.button>
            )}
            
            <Motion.button 
              className="btn btn-secondary" 
              onClick={reset}
              disabled={elapsed === 0 && !running}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={24} /> Reset
            </Motion.button>

            <Motion.button 
              className="btn btn-success" 
              onClick={saveSession}
              disabled={elapsed === 0 || running}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ backgroundColor: 'var(--success-color)', color: 'white' }}
            >
              <Save size={24} /> Save
            </Motion.button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <History size={20} />
          Recent Activity
        </h3>
        
        <div className="activity-list">
          <AnimatePresence>
            {logs.length === 0 ? (
              <p className="text-secondary" style={{ textAlign: 'center', padding: '1rem' }}>No time logs yet.</p>
            ) : (
              logs.map(log => (
                <Motion.div 
                  key={log.id}
                  className="activity-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{log.taskTitle}</h4>
                    <small className="text-secondary">{new Date(log.date).toLocaleString()}</small>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                    {formatTime(log.duration)}
                  </div>
                </Motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
