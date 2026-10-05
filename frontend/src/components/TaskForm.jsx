import { useState, useEffect } from 'react';

const empty = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };

export default function TaskForm({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        status: initial.status || 'todo',
        priority: initial.priority || 'medium',
        dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm(empty);
    }
  }, [initial, open]);

  if (!open) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-md bg-panel border border-line rounded-xl p-6">
        <h2 className="font-display text-lg font-semibold mb-4">
          {initial ? 'Edit task' : 'New task'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50 mb-1">Title</label>
            <input
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full bg-panel-light border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full bg-panel-light border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-accent resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-white/50 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-panel-light border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-white/50 mb-1">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full bg-panel-light border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50 mb-1">Due date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full bg-panel-light border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-line rounded-md py-2 text-sm hover:border-white/30 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-accent text-ink font-medium rounded-md py-2 text-sm hover:opacity-90 transition"
            >
              {initial ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
