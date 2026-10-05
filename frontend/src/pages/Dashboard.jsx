import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

const COLUMNS = [
  { key: 'todo', label: 'To do' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'done', label: 'Done' },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
      setError('');
    } catch {
      setError('Could not load tasks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateOrUpdate = async (form) => {
    try {
      if (editingTask) {
        const { data } = await api.put(`/tasks/${editingTask._id}`, form);
        setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      } else {
        const { data } = await api.post('/tasks', form);
        setTasks((prev) => [data, ...prev]);
      }
      setFormOpen(false);
      setEditingTask(null);
    } catch {
      setError('Could not save the task.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {
      setError('Could not delete the task.');
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-xl font-semibold">Your board</h1>
            <p className="text-sm text-white/50">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={openNew}
            className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 hover:opacity-90 transition"
          >
            + New task
          </button>
        </div>

        {error && (
          <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-white/50">Loading tasks…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="bg-panel border border-line rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs uppercase tracking-wide text-white/50">{col.label}</span>
                    <span className="text-xs text-white/30">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2 min-h-16">
                    {colTasks.map((task) => (
                      <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                    {colTasks.length === 0 && (
                      <p className="text-xs text-white/30 px-1 py-4 text-center">Nothing here yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initial={editingTask}
      />
    </div>
  );
}
