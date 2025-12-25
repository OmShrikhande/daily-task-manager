import { useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Target,
  Users,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const StatCard = ({ title, value, icon: IconComponent, color, trend, subtitle }) => (
  <Motion.div
    className="stat-card"
    whileHover={{ y: -4 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="stat-header">
      <div className={`stat-icon ${color}`}>
        <IconComponent size={24} />
      </div>
      {trend && (
        <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          <TrendingUp size={16} />
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <div className="stat-content">
      <h3>{value}</h3>
      <p>{title}</p>
      {subtitle && <small>{subtitle}</small>}
    </div>
  </Motion.div>
);

const Dashboard = ({ tasks, user }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const todayTasks = tasks.filter(t => t.taskDate === today);
    const weekTasks = tasks.filter(t => new Date(t.taskDate) >= thisWeek);
    
    const completedToday = todayTasks.filter(t => t.status === 'completed').length;
    const completedThisWeek = weekTasks.filter(t => t.status === 'completed').length;
    
    const totalTimeToday = todayTasks.reduce((acc, t) => {
      if (t.startTime && t.endTime) {
        const start = new Date(`${t.taskDate}T${t.startTime}`);
        const end = new Date(`${t.taskDate}T${t.endTime}`);
        return acc + (end - start) / (1000 * 60 * 60);
      }
      return acc;
    }, 0);

    const priorityStats = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    const categoryStats = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      todayTasks: todayTasks.length,
      completedToday,
      completedThisWeek,
      totalTimeToday: Math.round(totalTimeToday * 10) / 10,
      completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
      priorityStats,
      categoryStats
    };
  }, [tasks]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTasks = tasks.filter(t => t.taskDate === date);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayTasks.filter(t => t.status === 'completed').length,
        total: dayTasks.length
      };
    });
  }, [tasks]);

  const priorityChartData = Object.entries(stats.priorityStats).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    color: {
      low: '#10b981',
      medium: '#f59e0b', 
      high: '#ef4444',
      urgent: '#dc2626'
    }[priority]
  }));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.email?.split('@')[0]}!</h1>
          <p>Here's what's happening with your tasks today.</p>
        </div>
        <div className="quick-actions">
          <motion.button 
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + New Task
          </Motion.button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={CheckCircle}
          color="primary"
          trend={12}
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon={Target}
          color="success"
          subtitle={`${stats.todayTasks} total today`}
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={Activity}
          color="info"
          trend={stats.completionRate > 75 ? 8 : -3}
        />
        <StatCard
          title="Hours Today"
          value={`${stats.totalTimeToday}h`}
          icon={Clock}
          color="warning"
          subtitle="Productive time"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={AlertCircle}
          color="danger"
        />
        <StatCard
          title="This Week"
          value={stats.completedThisWeek}
          icon={Calendar}
          color="secondary"
          subtitle="Completed tasks"
        />
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="var(--primary-color)" />
              <Bar dataKey="total" fill="var(--secondary-color)" opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Task Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {priorityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {tasks.slice(0, 5).map(task => (
              <motion.div
                key={task.id}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className={`activity-icon ${task.status}`}>
                  {task.status === 'completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                <div className="activity-content">
                  <p>{task.content}</p>
                  <small>{new Date(task.createdAt).toLocaleString()}</small>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="widget upcoming-tasks">
          <h3>Today's Focus</h3>
          <div className="focus-tasks">
            {tasks
              .filter(t => t.taskDate === new Date().toISOString().split('T')[0] && t.status === 'pending')
              .slice(0, 4)
              .map(task => (
                <motion.div
                  key={task.id}
                  className="focus-task"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`priority-indicator ${task.priority}`}></div>
                  <div>
                    <p>{task.content}</p>
                    <small>{task.category}</small>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;