import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SystemMemory {
  totalMemory: number;
  usedMemory: number;
  processes: Array<{
    id: string;
    name: string;
    memoryUsage: number;
    startTime: number;
  }>;
  addProcess: (name: string, memoryUsage: number) => void;
  removeProcess: (id: string) => void;
  clearMemory: () => void;
}

export const useSystemMemory = create<SystemMemory>()(
  persist(
    (set) => ({
      totalMemory: 16384, // 16GB in MB
      usedMemory: 0,
      processes: [],
      addProcess: (name: string, memoryUsage: number) =>
        set((state) => {
          const newProcess = {
            id: Math.random().toString(36).substring(7),
            name,
            memoryUsage,
            startTime: Date.now(),
          };
          return {
            processes: [...state.processes, newProcess],
            usedMemory: state.usedMemory + memoryUsage,
          };
        }),
      removeProcess: (id: string) =>
        set((state) => {
          const process = state.processes.find((p) => p.id === id);
          return {
            processes: state.processes.filter((p) => p.id !== id),
            usedMemory: state.usedMemory - (process?.memoryUsage || 0),
          };
        }),
      clearMemory: () => set({ processes: [], usedMemory: 0 }),
    }),
    {
      name: 'system-memory',
    }
  )
);

export const formatMemorySize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};