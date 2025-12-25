import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, TrendingUp, CheckCircle, List } from 'lucide-react';

const Analytics = ({ tasks = [] }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const byCategory = tasks.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {});
    const byPriority = tasks.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {});
    
    return { total, completed, pending, completionRate, byCategory, byPriority };
  }, [tasks]);

  const pieData = Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }));
  
  const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 };
  const barData = Object.entries(stats.byPriority)
    .sort((a, b) => priorityOrder[a[0]] - priorityOrder[b[0]])
    .map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value,
      fill: name === 'urgent' ? '#dc2626' : name === 'high' ? '#ef4444' : name === 'medium' ? '#f59e0b' : '#10b981'
    }));

  return (
    <div className="analytics">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <BarChart3 size={28} className="text-primary" />
        <div>
          <h1>Analytics</h1>
          <p className="text-secondary">Overview of your productivity and tasks</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon secondary">
              <List size={24} />
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-trend positive">
              {stats.completionRate}% Rate
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon warning">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Tasks</p>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface-color)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }} 
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Tasks by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={pieData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={['#60a5fa', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][idx % 6]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
