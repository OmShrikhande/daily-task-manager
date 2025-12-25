import React, { useState, useRef } from 'react';
import { motion as Motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const TimeTracking = ({ tasks = [] }) => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const start = () => {
    if (running) return;
    setRunning(true);
    const startTime = Date.now() - elapsed;
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 250);
  };

  const stop = () => {
    setRunning(false);
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const reset = () => {
    stop();
    setElapsed(0);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Clock size={28} />
        <div>
          <h1>Time Tracking</h1>
          <p>Track time for tasks and projects. Basic timer provided here.</p>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {new Date(elapsed).toISOString().substr(11, 8)}
        </div>
        <div>
          <Motion.button className="btn btn-primary btn-sm" onClick={start} disabled={running}>
            Start
          </Motion.button>
          <Motion.button className="btn btn-secondary btn-sm" onClick={stop} style={{ marginLeft: '0.5rem' }}>
            Stop
          </Motion.button>
          <Motion.button className="btn btn-danger btn-sm" onClick={reset} style={{ marginLeft: '0.5rem' }}>
            Reset
          </Motion.button>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
