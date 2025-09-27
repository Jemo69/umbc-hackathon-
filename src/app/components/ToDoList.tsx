import React from 'react';

// Define the Task type
type Task = {
  id: number;
  title: string;
  dueDate: string;
  estimatedEffort: number; // in hours
  completed: boolean;
};

// Mock data for the to-do list
const mockTasks: Task[] = [
  { id: 1, title: 'Complete Math Homework', dueDate: '2025-10-05', estimatedEffort: 2, completed: false },
  { id: 2, title: 'Read Chapter 4 of History', dueDate: '2025-10-02', estimatedEffort: 1.5, completed: true },
  { id: 3, title: 'Prepare for Physics Lab', dueDate: '2025-10-03', estimatedEffort: 3, completed: false },
  { id: 4, title: 'Write English Essay', dueDate: '2025-10-10', estimatedEffort: 5, completed: false },
];

const ToDoList: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[]>(mockTasks);
  const [newTask, setNewTask] = React.useState({ title: '', dueDate: '', estimatedEffort: 0 });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.dueDate) return;
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    setTasks([...tasks, { ...newTask, id: newId, completed: false, estimatedEffort: Number(newTask.estimatedEffort) }]);
    setNewTask({ title: '', dueDate: '', estimatedEffort: 0 });
  };

  const handleToggleComplete = (id: number) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const getPriorityColor = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'border-l-4 border-red-500'; // Overdue
    if (diffDays <= 3) return 'border-l-4 border-yellow-500'; // Due soon
    return 'border-l-4 border-transparent'; // Not urgent
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
      <form onSubmit={handleAddTask} className="mb-4 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="p-2 border rounded w-full"
        />
        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Effort (hrs)"
          value={newTask.estimatedEffort}
          onChange={(e) => setNewTask({ ...newTask, estimatedEffort: Number(e.target.value) })}
          className="p-2 border rounded w-24"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">Add Task</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className={`flex items-center justify-between p-2 border-b ${getPriorityColor(task.dueDate)}`}>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task.id)}
                className="mr-2"
              />
              <div>
                <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                <div className="text-sm text-gray-500">
                  <span>Due: {task.dueDate}</span> | <span>Effort: {task.estimatedEffort} hrs</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToDoList;