
import React, { useState } from 'react';
import { Plus, Check, Trash2, Calendar, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/contexts/NotificationContext';
import { useTasksStore, getPriorityColor, TaskPriority } from '@/lib/stores/tasksStore';

// Using Task interface from tasksStore

const TaskManager = () => {
  // Use the persisted Zustand store instead of local state
  const {
    tasks,
    filter,
    addTask,
    toggleTask,
    deleteTask,
    setPriority,
    setFilter,
    getFilteredTasks
  } = useTasksStore();
  
  const [newTask, setNewTask] = useState('');
  const { showSuccess } = useNotification();
  
  // Get filtered tasks based on current filter
  const filteredTasks = getFilteredTasks();

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask);
      setNewTask('');
      showSuccess('Task added', 'New task has been created');
    }
  };

  const handleToggleTask = (taskId: string) => {
    toggleTask(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    showSuccess('Task deleted', 'Task has been removed');
  };

  const handleSetPriority = (taskId: string, priority: TaskPriority) => {
    setPriority(taskId, priority);
  };

  // getPriorityColor is now imported from tasksStore

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Add a new task..."
          className="flex-1 glass-effect border-white/20"
        />
        <Button onClick={handleAddTask} className="glass-effect">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded-lg text-sm capitalize transition-all ${
              filter === f ? 'bg-blue-500/20 text-blue-400' : 'glass-effect hover:bg-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg glass-effect ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <button
              onClick={() => handleToggleTask(task.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                task.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-white/30 hover:border-white/50'
              }`}
            >
              {task.completed && <Check className="w-3 h-3 text-white" />}
            </button>

            <div className={`flex-1 ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={task.priority}
                onChange={(e) => handleSetPriority(task.id, e.target.value as TaskPriority)}
                className="bg-transparent text-sm border border-white/20 rounded px-2 py-1"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
              <Button
                size="sm"
                onClick={() => handleDeleteTask(task.id)}
                variant="destructive"
                className="glass-effect"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          No tasks found. Add one above!
        </div>
      )}
    </div>
  );
};

export default TaskManager;
