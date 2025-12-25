import { useState, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

const Calendar = ({ tasks, onAddTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const dayTasks = tasks.filter(task => task.taskDate === dateStr);
      
      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth: current.getMonth() === month,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        tasks: dayTasks,
        completedTasks: dayTasks.filter(t => t.status === 'completed').length,
        totalTasks: dayTasks.length
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate, tasks]);

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const selectedDayTasks = selectedDate 
    ? tasks.filter(task => task.taskDate === selectedDate)
    : [];

  // Generate contribution timeline data (last 365 days)
  const contributionData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    const startDayOfWeek = startDate.getDay(); // 0 = Sunday
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(startDate.getDate() - startDayOfWeek);

    const data = [];
    for (let i = 0; i < 364; i++) {
      const date = new Date(adjustedStart);
      date.setDate(adjustedStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => task.taskDate === dateStr);
      const completedCount = dayTasks.filter(t => t.status === 'completed').length;
      
      data.push({
        date: dateStr,
        count: completedCount,
        level: completedCount === 0 ? 0 : 
               completedCount <= 2 ? 1 : 
               completedCount <= 4 ? 2 : 
               completedCount <= 6 ? 3 : 4
      });
    }
    
    // Group into weeks (7 days each)
    const weekData = [];
    for (let i = 0; i < data.length; i += 7) {
      weekData.push(data.slice(i, i + 7));
    }
    
    return { data: weekData, totalDays: data.length };
  }, [tasks]);

  return (
    <div className="calendar-view">
      {/* Contribution Timeline */}
      <div className="contribution-timeline">
        <div className="timeline-header">
          <h3>Task Completion Timeline</h3>
          <div className="legend">
            <span>Less</span>
            <div className="legend-squares">
              <div className="legend-square level-0"></div>
              <div className="legend-square level-1"></div>
              <div className="legend-square level-2"></div>
              <div className="legend-square level-3"></div>
              <div className="legend-square level-4"></div>
            </div>
            <span>More</span>
          </div>
        </div>
        
        <div className="timeline-grid">
          <div className="weekday-labels">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          
          <div className="weeks-grid">
            {contributionData.data.map((week, weekIndex) => (
              <div key={weekIndex} className="week-column">
                {week.map((day, dayIndex) => (
                  <Motion.div
                    key={day.date}
                    className={`day-square level-${day.level}`}
                    whileHover={{ scale: 1.2 }}
                    title={`${day.count} tasks completed on ${new Date(day.date).toLocaleDateString()}`}
                    onClick={() => setSelectedDate(day.date)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="calendar-header">
        <div className="calendar-nav">
          <Motion.button
            className="nav-btn"
            onClick={() => navigateMonth(-1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={20} />
          </Motion.button>
          
          <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          
          <Motion.button
            className="nav-btn"
            onClick={() => navigateMonth(1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={20} />
          </Motion.button>
        </div>
        
        <Motion.button
          className="btn btn-primary"
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} />
          Add Task
        </Motion.button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {daysOfWeek.map(day => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          <AnimatePresence mode="wait">
            {calendarData.map((day, index) => (
              <Motion.div
                key={`${day.dateStr}-${index}`}
                className={`calendar-day ${
                  !day.isCurrentMonth ? 'other-month' : ''
                } ${day.isToday ? 'today' : ''} ${
                  selectedDate === day.dateStr ? 'selected' : ''
                }`}
                onClick={() => setSelectedDate(day.dateStr)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
              >
                <div className="day-number">{day.date.getDate()}</div>
                
                {day.totalTasks > 0 && (
                  <div className="task-indicators">
                    <div className="task-count">
                      {day.completedTasks}/{day.totalTasks}
                    </div>
                    <div className="task-dots">
                      {day.tasks.slice(0, 3).map((task, i) => (
                        <div
                          key={i}
                          className={`task-dot ${task.priority} ${task.status}`}
                        />
                      ))}
                      {day.totalTasks > 3 && (
                        <div className="task-dot more">+{day.totalTasks - 3}</div>
                      )}
                    </div>
                  </div>
                )}
              </Motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedDate && (
          <Motion.div
            className="day-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="day-details-header">
              <h3>
                <CalendarIcon size={20} />
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedDate(null)}
              >
                Close
              </button>
            </div>

            <div className="day-tasks">
              {selectedDayTasks.length === 0 ? (
                <div className="no-tasks">
                  <p>No tasks scheduled for this day</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onAddTask && onAddTask(selectedDate)}
                  >
                    <Plus size={16} />
                    Add Task
                  </button>
                </div>
              ) : (
                <div className="task-list">
                  {selectedDayTasks.map(task => (
                    <Motion.div
                      key={task.id}
                      className={`task-item ${task.status}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className={`priority-indicator ${task.priority}`} />
                      <div className="task-content">
                        <h4>{task.content}</h4>
                        <p>{task.description}</p>
                        <div className="task-meta">
                          <span className="category">{task.category}</span>
                          {task.startTime && task.endTime && (
                            <span className="time">
                              {task.startTime} - {task.endTime}
                            </span>
                          )}
                          {task.project && (
                            <span className="project">{task.project}</span>
                          )}
                        </div>
                      </div>
                      <div className={`status-badge ${task.status}`}>
                        {task.status}
                      </div>
                    </Motion.div>
                  ))}
                </div>
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;