import { useState, useEffect } from 'react';
import { database, storage, auth } from '../../firebase';
import { ref as dbRef, push, onValue, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const TaskManager = () => {
  const [task, setTask] = useState('');
  const [file, setFile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const tasksRef = dbRef(database, 'tasks/' + auth.currentUser.uid);
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      const taskList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      // Sort by createdAt descending
      taskList.sort((a, b) => b.createdAt - a.createdAt);
      setTasks(taskList);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!task) return;
    setLoading(true);

    try {
      let fileUrl = '';
      if (file) {
        const fileRef = storageRef(storage, `files/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      const newTask = {
        content: task,
        fileUrl,
        status: 'pending',
        createdAt: Date.now(),
        completedAt: null
      };

      const tasksRef = dbRef(database, 'tasks/' + auth.currentUser.uid);
      await push(tasksRef, newTask);
      
      setTask('');
      setFile(null);
      // Reset file input manually if needed, or use a ref
      document.getElementById('fileInput').value = '';
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Error adding task: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    const taskRef = dbRef(database, `tasks/${auth.currentUser.uid}/${taskId}`);
    await update(taskRef, { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? Date.now() : null
    });
  };

  const deleteTask = async (taskId) => {
      if(!window.confirm("Are you sure you want to delete this task?")) return;
      const taskRef = dbRef(database, `tasks/${auth.currentUser.uid}/${taskId}`);
      await remove(taskRef);
  }

  return (
    <div className="task-manager">
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Add New Task</h2>
        <form onSubmit={handleAddTask} className="task-form">
          <div className="task-input-container">
            <input
              type="text"
              className="input-field"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What did you work on today?"
              required
            />
            <div className="file-input-wrapper">
              <input
                id="fileInput"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ fontSize: '0.875rem' }}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>

      <div className="task-list">
        {tasks.length === 0 && (
          <div className="empty-state">
            <p>No tasks found. Start by adding your first task above!</p>
          </div>
        )}
        {tasks.map((t) => (
          <div key={t.id} className={`task-item ${t.status === 'completed' ? 'completed' : ''}`}>
            <div className="task-content">
              <p className="task-text">{t.content}</p>
              <div className="task-meta">
                <span>{new Date(t.createdAt).toLocaleString()}</span>
                {t.fileUrl && (
                  <a href={t.fileUrl} target="_blank" rel="noopener noreferrer" className="attachment-link">
                    📎 Attachment
                  </a>
                )}
              </div>
            </div>
            <div className="task-actions">
              <button 
                onClick={() => toggleStatus(t.id, t.status)} 
                className={`btn btn-sm ${t.status === 'pending' ? 'btn-secondary' : 'btn-primary'}`}
              >
                {t.status === 'pending' ? 'Mark Done' : 'Completed'}
              </button>
              <button 
                onClick={() => deleteTask(t.id)} 
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
