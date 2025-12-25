import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const Analytics = ({ tasks = [] }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const byCategory = tasks.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {});
    return { total, completed, byCategory };
  }, [tasks]);

  const pieData = Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="card">
        <h1>Analytics</h1>
        <p>Quick overview of your task statistics</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h3>Total Tasks</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</p>
            <h3>Completed</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.completed}</p>
          </div>

          <div style={{ flex: 1 }}>
            <h3>By Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={['#60a5fa', '#34d399', '#f59e0b', '#ef4444'][idx % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
