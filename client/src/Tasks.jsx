import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

const EMPTY = { title: '', description: '', priority: 'medium', dueDate: '' };

export default function Tasks({ onUnauthorized }) {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ completed: '', priority: '', q: '' });
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const handle = useCallback((err) => {
    if (err.status === 401) onUnauthorized();
    else setError(err.message);
  }, [onUnauthorized]);

  const load = useCallback(async () => {
    try { setTasks(await api.listTasks(filters)); setError(''); }
    catch (e) { handle(e); }
    finally { setLoading(false); }
  }, [filters, handle]);

  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    const body = { ...form, dueDate: form.dueDate || null };
    try {
      if (editingId) await api.updateTask(editingId, body);
      else await api.createTask(body);
      setForm(EMPTY); setEditingId(null); load();
    } catch (err) { handle(err); }
  };

  const startEdit = (t) => {
    setEditingId(t._id);
    setForm({ title: t.title, description: t.description || '', priority: t.priority, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggle = (id) => api.toggleTask(id).then(load).catch(handle);
  const remove = (id) => api.deleteTask(id).then(load).catch(handle);
  const setF = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <>
      <form className="card" onSubmit={save}>
        <h2>{editingId ? 'Edit task' : 'Add a task'}</h2>
        <input placeholder="What needs doing?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={120} />
        <textarea placeholder="Notes (optional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="row">
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <button>{editingId ? 'Save' : 'Add'}</button>
          {editingId && <button type="button" className="ghost" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>}
        </div>
      </form>

      <div className="filters">
        <input placeholder="Search tasks…" value={filters.q} onChange={setF('q')} />
        <select value={filters.completed} onChange={setF('completed')}>
          <option value="">All</option><option value="false">Active</option><option value="true">Completed</option>
        </select>
        <select value={filters.priority} onChange={setF('priority')}>
          <option value="">Any priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? <p className="center">Loading…</p> : tasks.length === 0 ? <p className="center muted">No tasks yet.</p> : (
        <ul className="list">
          {tasks.map((t) => (
            <li key={t._id} className={t.completed ? 'done' : ''}>
              <input type="checkbox" checked={t.completed} onChange={() => toggle(t._id)} aria-label="Complete" />
              <div className="body">
                <strong>{t.title}</strong>
                {t.description && <p>{t.description}</p>}
                <small>
                  <span className={`pill ${t.priority}`}>{t.priority}</span>
                  {t.dueDate && <span> Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                </small>
              </div>
              <button className="ghost" onClick={() => startEdit(t)}>Edit</button>
              <button className="ghost danger" onClick={() => remove(t._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
