import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils/uuidUtil';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: Date;
  created: Date;
}

interface TasksState {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  
  // Actions
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setPriority: (id: string, priority: TaskPriority) => void;
  setDueDate: (id: string, date?: Date) => void;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  
  // Selectors
  getFilteredTasks: () => Task[];
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [
        {
          id: '1',
          title: 'Welcome to Task Manager',
          completed: false,
          priority: 'medium',
          created: new Date()
        }
      ],
      filter: 'all',
      
      // Actions
      addTask: (title) => {
        if (!title.trim()) return;
        
        const newTask: Task = {
          id: generateId(),
          title: title.trim(),
          completed: false,
          priority: 'medium',
          created: new Date()
        };
        
        set(state => ({ tasks: [newTask, ...state.tasks] }));
      },
      
      toggleTask: (id) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id 
              ? { ...task, completed: !task.completed } 
              : task
          )
        }));
      },
      
      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));
      },
      
      setPriority: (id, priority) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, priority } : task
          )
        }));
      },
      
      setDueDate: (id, date) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, dueDate: date } : task
          )
        }));
      },
      
      setFilter: (filter) => {
        set({ filter });
      },
      
      // Selectors
      getFilteredTasks: () => {
        const { tasks, filter } = get();
        
        switch (filter) {
          case 'active':
            return tasks.filter(task => !task.completed);
          case 'completed':
            return tasks.filter(task => task.completed);
          default:
            return tasks;
        }
      }
    }),
    {
      name: 'melani-tasks-storage',
      version: 1,
    }
  )
);

// Utility function for task priority color mapping
export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-green-400';
  }
};
