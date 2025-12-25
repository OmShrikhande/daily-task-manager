import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db, storage } from '../../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskItem from './TaskItem';

const categories = [
  'development', 'design', 'testing', 'deployment', 'maintenance',
  'meetings', 'documentation', 'research', 'bug-fixing', 'planning'
];

const priorities = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'urgent', label: 'Urgent', color: '#dc2626' }
];

const TaskManager = ({ user }) => {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('development');
  const [priority, setPriority] = useState('medium');
  const [project, setProject] = useState('');
  const [tags, setTags] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setProjects([]);
      return;
    }

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(taskList);

      // Extract unique projects
      const uniqueProjects = [...new Set(taskList.map(t => t.project).filter(p => p))];
      setProjects(uniqueProjects);
    }, (err) => {
      console.error('Error fetching tasks:', err);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          task.project?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesDate = !filterDate || task.taskDate === filterDate;

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [tasks, searchTerm, filterCategory, filterStatus, filterDate]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!task.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    // simple time validation
    if (startTime && endTime && startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }
    
    if (!user) {
      toast.error('You must be signed in to add tasks');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Adding task...');

    try {
      let fileUrl = '';
      if (file) {
        const fileRef = storageRef(storage, `files/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      const newTask = {
        content: task.trim(),
        description: description.trim(),
        category,
        priority,
        project: project.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        startTime,
        endTime,
        taskDate,
        fileUrl,
        status: 'pending',
        createdAt: Date.now(),
        completedAt: null,
        userId: user.uid,
        userEmail: user.email
      };

      await addDoc(collection(db, 'tasks'), newTask);

      // Reset form
      setTask('');
      setDescription('');
      setCategory('development');
      setPriority('medium');
      setProject('');
      setTags('');
      setStartTime('');
      setEndTime('');
      setTaskDate(new Date().toISOString().split('T')[0]);
      setFile(null);
      setShowAddForm(false);
      document.getElementById('fileInput')?.value && (document.getElementById('fileInput').value = '');
      
      toast.success('Task added successfully!', { id: loadingToast });
    } catch (err) {
      console.error("Error adding task:", err);
      toast.error("Error adding task: " + err.message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = useCallback(async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    const taskRef = doc(db, 'tasks', taskId);
    
    try {
      await updateDoc(taskRef, {
        status: newStatus,
        completedAt: newStatus === 'completed' ? Date.now() : null
      });
      
      toast.success(`Task marked as ${newStatus}!`);
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Error updating task status');
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
      toast.success('Task deleted successfully!');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Error deleting task');
    }
  }, []);

  return (
    <div className="task-manager">
      {/* Header */}
      <div className="task-manager-header">
        <div>
          <h1>Task Management</h1>
          <p>Organize and track your daily tasks efficiently</p>
        </div>
        <Motion.button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-expanded={showAddForm}
          aria-controls="add-task-form"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Add Task'}
        </Motion.button>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <Motion.div
            className="card"
            id="add-task-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} />
              Add New Task
            </h3>
            <form onSubmit={handleAddTask} className="task-form">
              <div className="form-grid">
                <div className="form-row">
                  <div>
                    <label className="input-label">Task Title *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder="What needs to be done?"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Description</label>
                  <textarea
                    className="input-field"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the task..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div>
                    <label className="input-label">Category</label>
                    <select
                      className="input-field"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Priority</label>
                    <select
                      className="input-field"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      {priorities.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Project</label>
                    <input
                      type="text"
                      className="input-field"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      placeholder="Project name"
                      list="projects"
                    />
                    <datalist id="projects">
                      {projects.map(p => <option key={p} value={p} />)}
                    </datalist>
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label className="input-label">Start Time</label>
                    <input
                      type="time"
                      className="input-field"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="input-label">End Time</label>
                    <input
                      type="time"
                      className="input-field"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label className="input-label">Tags (comma-separated)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="react, api, bug-fix"
                    />
                  </div>
                  <div>
                    <label className="input-label">Attachment</label>
                    <input
                      id="fileInput"
                      type="file"
                      className="input-field"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Motion.button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? 'Adding...' : 'Add Task'}
                </Motion.button>
                <Motion.button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Motion.button>
              </div>
            </form>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} />
          Filters & Search
        </h3>
        <div className="filter-grid">
          <div>
            <label className="input-label">
              <Search size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Search
            </label>
            <input
              type="text"
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, projects, tags..."
            />
          </div>
          <div>
            <label className="input-label">Category</label>
            <select
              className="input-field"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Status</label>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="input-label">
              <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Date
            </label>
            <input
              type="date"
              className="input-field"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="task-list">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <Motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3>No tasks found</h3>
              <p>
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterDate
                  ? 'No tasks match your current filters. Try adjusting your search criteria.'
                  : 'Start by adding your first task to get organized!'}
              </p>
              {!showAddForm && (
                <Motion.button
                  className="btn btn-primary"
                  onClick={() => setShowAddForm(true)}
                  whileHover={{ scale: 1.05 }}
                  style={{ marginTop: '1rem' }}
                >
                  <Plus size={16} />
                  Add Your First Task
                </Motion.button>
              )}
            </Motion.div>
          ) : (
            filteredTasks.map((t) => (
              <TaskItem 
                key={t.id} 
                task={t} 
                toggleStatus={toggleStatus} 
                deleteTask={deleteTask} 
                priorities={priorities}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(TaskManager);
