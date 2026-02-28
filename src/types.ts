export type View = 'dashboard' | 'timetable' | 'tasks' | 'pomodoro' | 'settings';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface TimetableEntry {
  id: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface SubjectRequirement {
  id: string;
  name: string;
  hoursPerWeek: number;
  sessionDuration: number; // in minutes
}

export interface UserSettings {
  darkMode: boolean;
  pomodoroTheme: string;
  userName: string;
}
