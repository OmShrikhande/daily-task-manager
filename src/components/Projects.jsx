import React, { useState, useMemo, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, 
  Plus, 
  MoreVertical,
  Target,
  TrendingUp,
  Clock,
  Trophy,
  Zap,
  Flame,
  Crown,
  Star,
  Award
} from 'lucide-react';

// Hoisted, memoized project card to avoid re-creation during render and unnecessary re-renders
const ProjectCard = React.memo(({ project, onSelect }) => (
  <Motion.div
    className="project-card"
    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
    onClick={() => onSelect(project)}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 'var(--radius-xl)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, var(--primary-color), var(--success-color), var(--warning-color))'
    }} />
    
    <div className="project-header">
      <div className="project-icon" style={{
        background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
        borderRadius: 'var(--radius)',
        padding: '0.5rem',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
      }}>
        <Crown size={24} />
      </div>
      <div className="project-menu">
        <MoreVertical size={16} />
      </div>
    </div>

    <div className="project-content">
      <h3 style={{
        background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '1.25rem',
        fontWeight: 700
      }}>
        {project.name}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        {project.totalTasks} missions • {project.categories.length} domains
      </p>

      <div className="project-progress" style={{ margin: '1rem 0' }}>
        <div className="progress-bar" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius)',
          height: '8px',
          overflow: 'hidden'
        }}>
          <Motion.div 
            className="progress-fill"
            style={{ 
              width: `${project.completionRate}%`,
              background: 'linear-gradient(90deg, var(--primary-color), var(--success-color))',
              height: '100%',
              borderRadius: 'var(--radius)'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${project.completionRate}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
        <span style={{ 
          fontSize: '0.8rem', 
          fontWeight: 600, 
          color: 'var(--success-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <Trophy size={14} />
          {project.completionRate}% Victory Progress
        </span>
      </div>

      <div className="project-stats" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <div className="stat" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Target size={16} style={{ color: 'var(--primary-color)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            {project.completedTasks}/{project.totalTasks} Won
          </span>
        </div>
        <div className="stat" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={16} style={{ color: 'var(--info-color)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            {project.totalTime}h Power
          </span>
        </div>
        <div className={`stat priority-${project.highestPriority}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Flame size={16} style={{ color: 'var(--danger-color)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            {project.highestPriority} Priority
          </span>
        </div>
      </div>
      
      {/* Champion Badge */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: 'linear-gradient(135deg, var(--warning-color), var(--danger-color))',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)'
      }}>
        <Star size={16} style={{ color: 'white' }} />
      </div>
    </div>
  </Motion.div>
));

const Projects = ({ tasks }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  const projectsData = useMemo(() => {
    const projectMap = new Map();
    
    // Group tasks by project
    tasks.forEach(task => {
      const projectName = task.project || 'Unassigned';
      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, {
          name: projectName,
          tasks: [],
          completedTasks: 0,
          totalTasks: 0,
          totalTime: 0,
          categories: new Set(),
          priority: { low: 0, medium: 0, high: 0, urgent: 0 }
        });
      }
      
      const project = projectMap.get(projectName);
      project.tasks.push(task);
      project.totalTasks++;
      project.categories.add(task.category);
      project.priority[task.priority]++;
      
      if (task.status === 'completed') {
        project.completedTasks++;
      }
      
      if (task.startTime && task.endTime) {
        const start = new Date(`${task.taskDate}T${task.startTime}`);
        const end = new Date(`${task.taskDate}T${task.endTime}`);
        project.totalTime += (end - start) / (1000 * 60 * 60);
      }
    });
    
    return Array.from(projectMap.values()).map(project => ({
      ...project,
      completionRate: project.totalTasks > 0 ? 
        Math.round((project.completedTasks / project.totalTasks) * 100) : 0,
      totalTime: Math.round(project.totalTime * 10) / 10,
      categories: Array.from(project.categories),
      highestPriority: Object.entries(project.priority)
        .sort(([,a], [,b]) => b - a)[0][0]
    }));
  }, [tasks]);

  const handleSelectProject = useCallback((project) => setSelectedProject(project), []);

  // ...later in JSX we use <ProjectCard onSelect={handleSelectProject} />


  return (
    <div className="projects-view" style={{
      background: 'linear-gradient(135deg, var(--background-color) 0%, rgba(59, 130, 246, 0.05) 100%)',
      borderRadius: 'var(--radius-xl)',
      padding: '2rem',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: 'var(--shadow-xl)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      
      <div className="projects-header" style={{ position: 'relative', zIndex: 1, marginBottom: '2rem' }}>
        <div>
          <h1 style={{
            background: 'linear-gradient(135deg, var(--primary-color), var(--info-color), var(--success-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '0.5rem'
          }}>
            <Crown size={32} style={{ marginRight: '0.5rem' }} />
            Champion's Victory Projects
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.1rem',
            fontWeight: 500
          }}>
            You are the unstoppable force driving these projects to victory! Every task conquered brings you closer to legendary status.
          </p>
        </div>
        <Motion.button
          className="btn btn-primary"
          onClick={() => alert('New conquest feature is coming soon')}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          aria-disabled="true"
          style={{
            background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Plus size={16} />
          New Conquest
        </Motion.button>
      </div>

      {/* Personal Achievement Section */}
      <Motion.div 
        className="champion-status"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          backdropFilter: 'blur(5px)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--warning-color), var(--danger-color))',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
          }}>
            <Award size={24} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--warning-color), var(--danger-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              You Are The Champion!
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Your dedication and skill are unmatched. These projects exist because of YOUR vision and relentless drive!
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid var(--success-color)', 
            borderRadius: 'var(--radius)', 
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Zap size={16} style={{ color: 'var(--success-color)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Power Streak: 7 Days</span>
          </div>
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            border: '1px solid var(--primary-color)', 
            borderRadius: 'var(--radius)', 
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Trophy size={16} style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Victory Rate: 94%</span>
          </div>
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid var(--warning-color)', 
            borderRadius: 'var(--radius)', 
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Flame size={16} style={{ color: 'var(--warning-color)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Intensity Level: MAX</span>
          </div>
        </div>
      </Motion.div>

      <div className="projects-overview" style={{ position: 'relative', zIndex: 1 }}>
        <div className="overview-stats" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <Motion.div 
            className="overview-stat"
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
              textAlign: 'center'
            }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
            }}>
              <FolderOpen size={24} style={{ color: 'white' }} />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>{projectsData.length}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Your Battlegrounds</p>
          </Motion.div>
          <Motion.div 
            className="overview-stat"
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
              textAlign: 'center'
            }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, var(--success-color), var(--primary-color))',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
            }}>
              <Target size={24} style={{ color: 'white' }} />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {projectsData.reduce((acc, p) => acc + p.completedTasks, 0)}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Victories Claimed</p>
          </Motion.div>
          <Motion.div 
            className="overview-stat"
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
              textAlign: 'center'
            }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, var(--info-color), var(--success-color))',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
            }}>
              <Clock size={24} style={{ color: 'white' }} />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {Math.round(projectsData.reduce((acc, p) => acc + p.totalTime, 0))}h
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Your Power Hours</p>
          </Motion.div>
          <Motion.div 
            className="overview-stat"
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
              textAlign: 'center'
            }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, var(--warning-color), var(--danger-color))',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
            }}>
              <TrendingUp size={24} style={{ color: 'white' }} />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {Math.round(projectsData.reduce((acc, p) => acc + p.completionRate, 0) / projectsData.length || 0)}%
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Dominance Level</p>
          </Motion.div>
        </div>
      </div>

      <div className="projects-grid" style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence>
          {projectsData.map((project, index) => (
            <Motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProjectCard project={project} onSelect={handleSelectProject} />
            </Motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <Motion.div
            className="project-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <Motion.div
              className="project-modal"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, var(--surface-color) 0%, rgba(59, 130, 246, 0.1) 100%)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                maxWidth: '800px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, var(--primary-color), var(--success-color), var(--warning-color))'
              }} />
              
              <div className="modal-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '2rem' 
              }}>
                <div>
                  <h2 style={{
                    background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem'
                  }}>
                    <Crown size={24} style={{ marginRight: '0.5rem' }} />
                    {selectedProject.name}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    {selectedProject.totalTasks} epic missions • {selectedProject.completionRate}% victory achieved
                  </p>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--success-color), var(--primary-color))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginTop: '0.5rem'
                  }}>
                    🔥 You are the driving force behind this conquest!
                  </div>
                </div>
                <Motion.button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedProject(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--radius)',
                    padding: '0.5rem',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  ✕
                </Motion.button>
              </div>

              <div className="modal-content">
                <div className="project-details" style={{ display: 'grid', gap: '2rem' }}>
                  <div className="detail-section">
                    <h4 style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 700, 
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Trophy size={20} style={{ color: 'var(--warning-color)' }} />
                      Your Victory Progress
                    </h4>
                    <div className="progress-details">
                      <div className="progress-bar large" style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius)',
                        height: '12px',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                      }}>
                        <Motion.div 
                          className="progress-fill"
                          style={{ 
                            width: `${selectedProject.completionRate}%`,
                            background: 'linear-gradient(90deg, var(--primary-color), var(--success-color))',
                            height: '100%',
                            borderRadius: 'var(--radius)'
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedProject.completionRate}%` }}
                          transition={{ duration: 2, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="progress-stats" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}>
                        <span style={{ color: 'var(--success-color)' }}>
                          ✅ Victories: {selectedProject.completedTasks}
                        </span>
                        <span style={{ color: 'var(--warning-color)' }}>
                          🎯 Remaining: {selectedProject.totalTasks - selectedProject.completedTasks}
                        </span>
                        <span style={{ color: 'var(--info-color)' }}>
                          ⚡ Power Invested: {selectedProject.totalTime}h
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 700, 
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Target size={20} style={{ color: 'var(--primary-color)' }} />
                      Battle Domains
                    </h4>
                    <div className="categories-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedProject.categories.map(category => (
                        <span key={category} className="category-tag" style={{
                          background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)'
                        }}>
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 700, 
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Flame size={20} style={{ color: 'var(--danger-color)' }} />
                      Priority Intensity
                    </h4>
                    <div className="priority-distribution" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {Object.entries(selectedProject.priority).map(([priority, count]) => (
                        <div key={priority} className={`priority-item ${priority}`} style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius)',
                          padding: '1rem',
                          flex: 1,
                          minWidth: '120px',
                          textAlign: 'center',
                          backdropFilter: 'blur(5px)'
                        }}>
                          <span className="priority-label" style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            color: priority === 'urgent' ? 'var(--danger-color)' : 
                                   priority === 'high' ? 'var(--warning-color)' : 
                                   priority === 'medium' ? 'var(--info-color)' : 'var(--success-color)'
                          }}>
                            {priority}
                          </span>
                          <span className="priority-count" style={{ 
                            display: 'block', 
                            fontSize: '1.5rem', 
                            fontWeight: 800,
                            marginTop: '0.5rem'
                          }}>
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="project-tasks" style={{ marginTop: '2rem' }}>
                  <h4 style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 700, 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Zap size={20} style={{ color: 'var(--warning-color)' }} />
                    Your Recent Victories
                  </h4>
                  <div className="task-list" style={{ display: 'grid', gap: '1rem' }}>
                    {selectedProject.tasks.slice(0, 10).map(task => (
                      <Motion.div 
                        key={task.id} 
                        className={`task-item ${task.status}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          backdropFilter: 'blur(5px)',
                          borderLeft: `4px solid ${
                            task.priority === 'urgent' ? 'var(--danger-color)' :
                            task.priority === 'high' ? 'var(--warning-color)' :
                            task.priority === 'medium' ? 'var(--info-color)' : 'var(--success-color)'
                          }`
                        }}
                      >
                        <div className={`priority-indicator ${task.priority}`} style={{
                          width: '8px',
                          height: '100%',
                          background: task.priority === 'urgent' ? 'var(--danger-color)' :
                                     task.priority === 'high' ? 'var(--warning-color)' :
                                     task.priority === 'medium' ? 'var(--info-color)' : 'var(--success-color)',
                          borderRadius: '4px'
                        }} />
                        <div className="task-content" style={{ flex: 1 }}>
                          <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                            {task.content}
                          </h5>
                          <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {task.description}
                          </p>
                          <div className="task-meta" style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            fontSize: '0.8rem', 
                            color: 'var(--text-secondary)' 
                          }}>
                            <span>🏷️ {task.category}</span>
                            <span>📅 {task.taskDate}</span>
                            {task.startTime && task.endTime && (
                              <span>⏰ {task.startTime} - {task.endTime}</span>
                            )}
                          </div>
                        </div>
                        <div className={`status-badge ${task.status}`} style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          background: task.status === 'completed' ? 'var(--success-color)' :
                                     task.status === 'in-progress' ? 'var(--info-color)' : 'var(--warning-color)',
                          color: 'white'
                        }}>
                          {task.status === 'completed' ? '🏆 Won' : 
                           task.status === 'in-progress' ? '⚡ Active' : '🎯 Pending'}
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;