import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Calendar, Clock, Tag, Paperclip, CheckCircle, Trash2 } from 'lucide-react';

const TaskItem = ({ task: t, toggleStatus, deleteTask, priorities }) => {
  return (
    <Motion.div
      className={`task-item ${t.status === 'completed' ? 'completed' : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <div className="task-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <h4 className="task-text">{t.content}</h4>
          <span
            className="priority-badge"
            style={{
              backgroundColor: priorities.find(p => p.value === t.priority)?.color || '#64748b',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}
          >
            {t.priority}
          </span>
        </div>

        {t.description && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
            {t.description}
          </p>
        )}

        <div className="task-meta">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} />
              {new Date(t.taskDate).toLocaleDateString()}
            </span>
            <span>{t.category}</span>
            {t.project && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                📁 {t.project}
              </span>
            )}
            {t.startTime && t.endTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} />
                {t.startTime} - {t.endTime}
              </span>
            )}
          </div>
          
          {t.tags && t.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {t.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.625rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.125rem'
                  }}
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {t.fileUrl && (
            <a
              href={t.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="attachment-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '0.5rem',
                color: 'var(--primary-color)',
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              <Paperclip size={12} />
              View Attachment
            </a>
          )}
        </div>
      </div>
      
      <div className="task-actions">
        <Motion.button
          onClick={() => toggleStatus(t.id, t.status)}
          className={`btn btn-sm ${
            t.status === 'pending' ? 'btn-primary' : 'btn-secondary'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CheckCircle size={14} />
          {t.status === 'pending' ? 'Complete' : 'Completed'}
        </Motion.button>
        <Motion.button
          onClick={() => deleteTask(t.id)}
          className="btn btn-danger btn-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 size={14} />
          Delete
        </Motion.button>
      </div>
    </Motion.div>
  );
};

export default React.memo(TaskItem);
