import { motion as Motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  Users,
  FolderOpen,
  Clock
} from 'lucide-react';

const Sidebar = ({ activeView, setActiveView, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'timetrack', label: 'Time Tracking', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <Motion.aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      transition={{ duration: 0.3 }}
    >
      <div className="sidebar-header">
        <Motion.button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ☰
        </Motion.button>
        {!isCollapsed && (
          <Motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            TaskFlow Pro
          </Motion.h2>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Motion.button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Motion.button>
          );
        })}
      </nav>
    </Motion.aside>
  );
};

export default Sidebar;