import React, { useState, useMemo, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, 
  Plus, 
  MoreVertical,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';

// Hoisted, memoized project card to avoid re-creation during render and unnecessary re-renders
const ProjectCard = React.memo(({ project, onSelect }) => (
  <Motion.div
    className="project-card"
    whileHover={{ y: -4 }}
    onClick={() => onSelect(project)}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="project-header">
      <div className="project-icon">
        <FolderOpen size={24} />
      </div>
      <div className="project-menu">
        <MoreVertical size={16} />
      </div>
    </div>

    <div className="project-content">
      <h3>{project.name}</h3>
      <p>{project.totalTasks} tasks • {project.categories.length} categories</p>

      <div className="project-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${project.completionRate}%` }}
          />
        </div>
        <span>{project.completionRate}% complete</span>
      </div>

      <div className="project-stats">
        <div className="stat">
          <Target size={16} />
          <span>{project.completedTasks}/{project.totalTasks}</span>
        </div>
        <div className="stat">
          <Clock size={16} />
          <span>{project.totalTime}h</span>
        </div>
        <div className={`stat priority-${project.highestPriority}`}>
          <TrendingUp size={16} />
          <span>{project.highestPriority}</span>
        </div>
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
    <div className="projects-view">
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p>Organize and track your project progress</p>
        </div>
        <Motion.button
          className="btn btn-primary"
          onClick={() => alert('New project feature is coming soon')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-disabled="true"
        >
          <Plus size={16} />
          New Project
        </Motion.button>
      </div>

      <div className="projects-overview">
        <div className="overview-stats">
          <div className="overview-stat">
            <h3>{projectsData.length}</h3>
            <p>Active Projects</p>
          </div>
          <div className="overview-stat">
            <h3>{projectsData.reduce((acc, p) => acc + p.completedTasks, 0)}</h3>
            <p>Completed Tasks</p>
          </div>
          <div className="overview-stat">
            <h3>{Math.round(projectsData.reduce((acc, p) => acc + p.totalTime, 0))}h</h3>
            <p>Total Time</p>
          </div>
          <div className="overview-stat">
            <h3>{Math.round(projectsData.reduce((acc, p) => acc + p.completionRate, 0) / projectsData.length || 0)}%</h3>
            <p>Avg. Completion</p>
          </div>
        </div>
      </div>

      <div className="projects-grid">
        <AnimatePresence>
          {projectsData.map((project) => (
            <ProjectCard key={project.name} project={project} onSelect={handleSelectProject} />
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
          >
            <Motion.div
              className="project-modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2>{selectedProject.name}</h2>
                  <p>{selectedProject.totalTasks} tasks • {selectedProject.completionRate}% complete</p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </button>
              </div>

              <div className="modal-content">
                <div className="project-details">
                  <div className="detail-section">
                    <h4>Progress Overview</h4>
                    <div className="progress-details">
                      <div className="progress-bar large">
                        <div 
                          className="progress-fill"
                          style={{ width: `${selectedProject.completionRate}%` }}
                        />
                      </div>
                      <div className="progress-stats">
                        <span>Completed: {selectedProject.completedTasks}</span>
                        <span>Remaining: {selectedProject.totalTasks - selectedProject.completedTasks}</span>
                        <span>Total Time: {selectedProject.totalTime}h</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Categories</h4>
                    <div className="categories-list">
                      {selectedProject.categories.map(category => (
                        <span key={category} className="category-tag">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Priority Distribution</h4>
                    <div className="priority-distribution">
                      {Object.entries(selectedProject.priority).map(([priority, count]) => (
                        <div key={priority} className={`priority-item ${priority}`}>
                          <span className="priority-label">{priority}</span>
                          <span className="priority-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="project-tasks">
                  <h4>Recent Tasks</h4>
                  <div className="task-list">
                    {selectedProject.tasks.slice(0, 10).map(task => (
                      <div key={task.id} className={`task-item ${task.status}`}>
                        <div className={`priority-indicator ${task.priority}`} />
                        <div className="task-content">
                          <h5>{task.content}</h5>
                          <p>{task.description}</p>
                          <div className="task-meta">
                            <span>{task.category}</span>
                            <span>{task.taskDate}</span>
                            {task.startTime && task.endTime && (
                              <span>{task.startTime} - {task.endTime}</span>
                            )}
                          </div>
                        </div>
                        <div className={`status-badge ${task.status}`}>
                          {task.status}
                        </div>
                      </div>
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