import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Timer, 
  Settings as SettingsIcon,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  Sparkles,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { View, Task, TimetableEntry, UserSettings, SubjectRequirement } from './types';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from "firebase/firestore";

// --- Components ---

const Sidebar = ({ currentView, setView, darkMode, toggleDarkMode }: { 
  currentView: View, 
  setView: (v: View) => void,
  darkMode: boolean,
  toggleDarkMode: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable' as View, label: 'Timetable', icon: Calendar },
    { id: 'tasks' as View, label: 'Tasks', icon: CheckSquare },
    { id: 'pomodoro' as View, label: 'Pomodoro', icon: Timer },
    { id: 'settings' as View, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-900 shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <h1 className="text-xl font-display font-bold tracking-tight">StudyFlow</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setIsOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${currentView === item.id 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400"
          >
            <span className="text-sm font-medium">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
};

const Dashboard = ({ tasks, timetable }: { tasks: Task[], timetable: TimetableEntry[] }) => {
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysClasses = timetable.filter(e => e.day === today);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold">Welcome back!</h2>
        <p className="text-slate-500 dark:text-slate-400">Here's what's happening today, {today}.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <CheckSquare size={24} />
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tasks</span>
          </div>
          <p className="text-4xl font-display font-bold">{pendingTasks}</p>
          <p className="text-sm opacity-80 mt-1">Pending tasks to complete</p>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <Calendar size={24} />
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Schedule</span>
          </div>
          <p className="text-4xl font-display font-bold">{todaysClasses.length}</p>
          <p className="text-sm opacity-80 mt-1">Classes scheduled for today</p>
        </div>

        <div className="p-6 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <Timer size={24} />
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Focus</span>
          </div>
          <p className="text-4xl font-display font-bold">0h</p>
          <p className="text-sm opacity-80 mt-1">Focus time today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-xl font-display font-bold">Next Classes</h3>
          <div className="space-y-3">
            {todaysClasses.length > 0 ? todaysClasses.map(entry => (
              <div key={entry.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <div>
                    <h4 className="font-bold">{entry.subject}</h4>
                    <p className="text-sm text-slate-500">{entry.startTime} - {entry.endTime}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                No classes today. Enjoy your free time!
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-display font-bold">Recent Tasks</h3>
          <div className="space-y-3">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-slate-300' : 'bg-indigo-500'}`}></div>
                <span className={task.completed ? 'line-through text-slate-400' : ''}>{task.text}</span>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                All caught up!
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const Timetable = ({ entries, setEntries }: { entries: TimetableEntry[], setEntries: (e: TimetableEntry[]) => void }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<TimetableEntry>>({
    day: 'Monday',
    color: '#6366f1'
  });

  // Generator states
  const [subjectReqs, setSubjectReqs] = useState<SubjectRequirement[]>([]);
  const [genConfig, setGenConfig] = useState({
    startTime: '09:00',
    endTime: '17:00',
    buffer: 10
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const addEntry = () => {
    if (newEntry.subject && newEntry.startTime && newEntry.endTime) {
      setEntries([...entries, { ...newEntry, id: Date.now().toString() } as TimetableEntry]);
      setIsAdding(false);
      setNewEntry({ day: 'Monday', color: '#6366f1' });
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const addSubjectReq = () => {
    setSubjectReqs([...subjectReqs, { id: Date.now().toString(), name: '', hoursPerWeek: 2, sessionDuration: 60 }]);
  };

  const updateSubjectReq = (id: string, field: keyof SubjectRequirement, value: any) => {
    setSubjectReqs(subjectReqs.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeSubjectReq = (id: string) => {
    setSubjectReqs(subjectReqs.filter(r => r.id !== id));
  };

  const generateTimetable = () => {
    const newTimetable: TimetableEntry[] = [];
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    
    // Prepare sessions queue
    let sessionsQueue: { name: string, duration: number, color: string }[] = [];
    subjectReqs.forEach((req, idx) => {
      if (isNaN(req.hoursPerWeek) || isNaN(req.sessionDuration) || req.sessionDuration <= 0) return;
      
      const numSessions = Math.ceil((req.hoursPerWeek * 60) / req.sessionDuration);
      for (let i = 0; i < numSessions; i++) {
        sessionsQueue.push({ 
          name: req.name || 'Untitled Subject', 
          duration: req.sessionDuration,
          color: colors[idx % colors.length]
        });
      }
    });

    // Shuffle queue for better distribution
    sessionsQueue = sessionsQueue.sort(() => Math.random() - 0.5);

    const startMinutes = parseInt(genConfig.startTime.split(':')[0]) * 60 + parseInt(genConfig.startTime.split(':')[1]);
    const endMinutes = parseInt(genConfig.endTime.split(':')[0]) * 60 + parseInt(genConfig.endTime.split(':')[1]);
    const buffer = isNaN(genConfig.buffer) ? 0 : genConfig.buffer;

    let currentDayIdx = 0;
    let currentMinutes = startMinutes;

    while (sessionsQueue.length > 0 && currentDayIdx < 7) {
      const session = sessionsQueue[0];
      
      if (currentMinutes + session.duration <= endMinutes) {
        // Add session
        const startH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
        const startM = (currentMinutes % 60).toString().padStart(2, '0');
        const endH = Math.floor((currentMinutes + session.duration) / 60).toString().padStart(2, '0');
        const endM = ((currentMinutes + session.duration) % 60).toString().padStart(2, '0');

        newTimetable.push({
          id: Math.random().toString(36).substr(2, 9),
          subject: session.name,
          day: days[currentDayIdx],
          startTime: `${startH}:${startM}`,
          endTime: `${endH}:${endM}`,
          color: session.color
        });

        currentMinutes += session.duration + buffer;
        sessionsQueue.shift();
      } else {
        // Move to next day
        currentDayIdx++;
        currentMinutes = startMinutes;
      }
    }

    setEntries(newTimetable);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Timetable</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your weekly class schedule.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsGenerating(true)}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-xl font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2"
          >
            <Sparkles size={18} />
            Auto Generate
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add Class
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map(day => (
          <div key={day} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 text-center">{day.slice(0, 3)}</h3>
            <div className="space-y-3">
              {entries.filter(e => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => (
                <div 
                  key={entry.id} 
                  className="group relative p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md"
                  style={{ borderLeft: `4px solid ${entry.color}` }}
                >
                  <button 
                    onClick={() => deleteEntry(entry.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X size={12} />
                  </button>
                  <h4 className="text-sm font-bold truncate">{entry.subject}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">{entry.startTime} - {entry.endTime}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-display font-bold mb-4">Add New Class</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                    placeholder="e.g. Mathematics"
                    onChange={e => setNewEntry({ ...newEntry, subject: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input 
                      type="time" 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                      onChange={e => setNewEntry({ ...newEntry, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input 
                      type="time" 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                      onChange={e => setNewEntry({ ...newEntry, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Day</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                    value={newEntry.day}
                    onChange={e => setNewEntry({ ...newEntry, day: e.target.value })}
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color Tag</label>
                  <div className="flex gap-2">
                    {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                      <button
                        key={c}
                        onClick={() => setNewEntry({ ...newEntry, color: c })}
                        className={`w-8 h-8 rounded-full border-2 ${newEntry.color === c ? 'border-slate-950 dark:border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addEntry}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium"
                  >
                    Save Class
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold">Timetable Generator</h3>
                <button onClick={() => setIsGenerating(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <section className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Available Study Time</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Start Time</label>
                      <input 
                        type="time" 
                        value={genConfig.startTime}
                        onChange={e => setGenConfig({ ...genConfig, startTime: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">End Time</label>
                      <input 
                        type="time" 
                        value={genConfig.endTime}
                        onChange={e => setGenConfig({ ...genConfig, endTime: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Buffer (min)</label>
                      <input 
                        type="number" 
                        value={isNaN(genConfig.buffer) ? '' : genConfig.buffer}
                        onChange={e => setGenConfig({ ...genConfig, buffer: e.target.value === '' ? NaN : parseInt(e.target.value) })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Subjects & Requirements</h4>
                    <button 
                      onClick={addSubjectReq}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Subject
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {subjectReqs.map(req => (
                      <div key={req.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Subject Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Physics"
                            value={req.name}
                            onChange={e => updateSubjectReq(req.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Hrs / Week</label>
                          <input 
                            type="number" 
                            value={isNaN(req.hoursPerWeek) ? '' : req.hoursPerWeek}
                            onChange={e => updateSubjectReq(req.id, 'hoursPerWeek', e.target.value === '' ? NaN : parseFloat(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Session (min)</label>
                          <input 
                            type="number" 
                            value={isNaN(req.sessionDuration) ? '' : req.sessionDuration}
                            onChange={e => updateSubjectReq(req.id, 'sessionDuration', e.target.value === '' ? NaN : parseInt(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                          />
                        </div>
                        <div className="sm:col-span-1 flex justify-center">
                          <button 
                            onClick={() => removeSubjectReq(req.id)}
                            className="p-2 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {subjectReqs.length === 0 && (
                      <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
                        Add subjects to start generating your timetable.
                      </div>
                    )}
                  </div>
                </section>

                <div className="pt-4">
                  <button 
                    onClick={generateTimetable}
                    disabled={subjectReqs.length === 0}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles size={20} />
                    Generate Weekly Timetable
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-3">
                    Note: Generating a new timetable will replace your current one.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TodoList = ({ tasks, setTasks }: { tasks: Task[], setTasks: (t: Task[]) => void }) => {
  const [newTask, setNewTask] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([{
        id: Date.now().toString(),
        text: newTask,
        completed: false,
        priority: 'medium',
        createdAt: Date.now()
      }, ...tasks]);
      setNewTask('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold">Tasks</h2>
        <p className="text-slate-500 dark:text-slate-400">Stay on top of your assignments and goals.</p>
      </header>

      <form onSubmit={addTask} className="flex gap-3">
        <input 
          type="text" 
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
        <button 
          type="submit"
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          Add
        </button>
      </form>

      <div className="space-y-3">
        {tasks.map(task => (
          <motion.div 
            layout
            key={task.id} 
            className={`
              group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-all
              ${task.completed ? 'opacity-60' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'}`}
              >
                {task.completed && <CheckSquare size={14} />}
              </button>
              <span className={`font-medium ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.text}</span>
            </div>
            <button 
              onClick={() => deleteTask(task.id)}
              className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={18} />
            </button>
          </motion.div>
        ))}
        {tasks.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
            <CheckSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No tasks yet</p>
            <p className="text-sm">Add your first task to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Pomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      setMode(nextMode);
      setTimeLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
      // Play sound or notification here
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="max-w-xl mx-auto text-center space-y-12 py-12">
      <header className="space-y-4">
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button 
            onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'focus' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
          >
            Focus
          </button>
          <button 
            onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'break' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
          >
            Break
          </button>
        </div>
        <h2 className="text-2xl font-display font-bold">{mode === 'focus' ? 'Time to Focus' : 'Take a Break'}</h2>
      </header>

      <div className="relative flex items-center justify-center">
        <div className="w-80 h-80 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center">
          <div className="text-7xl font-display font-bold tracking-tighter tabular-nums">
            {formatTime(timeLeft)}
          </div>
        </div>
        {/* Progress ring could be added here */}
      </div>

      <div className="flex justify-center gap-6">
        <button 
          onClick={resetTimer}
          className="w-16 h-16 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <X size={24} />
        </button>
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform hover:scale-105 ${isActive ? 'bg-red-500 shadow-red-200' : 'bg-indigo-600 shadow-indigo-200'}`}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <div className="w-16 h-16"></div> {/* Spacer for balance */}
      </div>
    </div>
  );
};

const Settings = ({ settings, setSettings }: { settings: UserSettings, setSettings: (s: UserSettings) => void }) => {
  const clearData = () => {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Personalize your dashboard experience.</p>
      </header>

      <div className="space-y-6">
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-lg font-bold">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
            </div>
            <button 
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.darkMode ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-lg font-bold">Profile</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input 
              type="text" 
              value={settings.userName}
              onChange={e => setSettings({ ...settings, userName: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
              placeholder="Enter your name"
            />
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-red-500">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Clear All Data</p>
              <p className="text-sm text-slate-500">Delete all tasks, timetable entries, and settings.</p>
            </div>
            <button 
              onClick={clearData}
              className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 transition-all"
            >
              Clear Data
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    pomodoroTheme: 'default',
    userName: 'Student'
  });
  const [userEmail] = useState<string>("default_user");
  const isSyncingFromServer = useRef(false);

  // Firestore sync
  useEffect(() => {
    const email = "default_user";
    
    // Listen for Firestore updates
    const userDocRef = doc(db, "users", email);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        isSyncingFromServer.current = true;
        if (data.tasks) setTasks(data.tasks);
        if (data.timetable) setTimetable(data.timetable);
        if (data.settings) setSettings(data.settings);
        // Reset flag after state updates are processed
        setTimeout(() => {
          isSyncingFromServer.current = false;
        }, 100);
      } else {
        // If no doc exists, create one with current local data (if any)
        const initialData = {
          tasks: JSON.parse(localStorage.getItem('studyflow_tasks') || '[]'),
          timetable: JSON.parse(localStorage.getItem('studyflow_timetable') || '[]'),
          settings: JSON.parse(localStorage.getItem('studyflow_settings') || '{"darkMode":false,"pomodoroTheme":"default","userName":"Student"}')
        };
        setDoc(userDocRef, initialData).catch(err => console.error("Error creating user doc:", err));
      }
    }, (error) => {
      console.error("Firestore snapshot error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Save data to Firestore
  useEffect(() => {
    if (!isSyncingFromServer.current) {
      const userDocRef = doc(db, "users", userEmail);
      setDoc(userDocRef, { tasks, timetable, settings }, { merge: true })
        .catch(err => console.error("Error saving to Firestore:", err));
      
      // Also keep local storage as fallback
      localStorage.setItem('studyflow_tasks', JSON.stringify(tasks));
      localStorage.setItem('studyflow_timetable', JSON.stringify(timetable));
      localStorage.setItem('studyflow_settings', JSON.stringify(settings));
    }

    // Always apply theme locally
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [tasks, timetable, settings, userEmail]);

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        darkMode={settings.darkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
      
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'dashboard' && <Dashboard tasks={tasks} timetable={timetable} />}
              {view === 'timetable' && <Timetable entries={timetable} setEntries={setTimetable} />}
              {view === 'tasks' && <TodoList tasks={tasks} setTasks={setTasks} />}
              {view === 'pomodoro' && <Pomodoro />}
              {view === 'settings' && <Settings settings={settings} setSettings={setSettings} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
