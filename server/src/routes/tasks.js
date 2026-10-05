const router = require('express').Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

router.use(protect); // every task route requires a valid JWT

const FIELDS = ['title', 'description', 'priority', 'dueDate', 'completed'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// List own tasks. Filters: ?completed=true|false &priority=low|medium|high &q=text
router.get('/', async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.completed === 'true' || req.query.completed === 'false')
    filter.completed = req.query.completed === 'true';
  if (['low', 'medium', 'high'].includes(req.query.priority)) filter.priority = req.query.priority;
  if (req.query.q) filter.title = { $regex: escapeRe(String(req.query.q)), $options: 'i' };
  res.json(await Task.find(filter).sort({ completed: 1, createdAt: -1 }));
});

router.post('/', async (req, res) => {
  try {
    const task = await Task.create({ ...pick(req.body), user: req.user._id });
    res.status(201).json(task);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Scoped by user: someone else's task looks exactly like a missing one (404).
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, pick(req.body),
      { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (e) {
    res.status(400).json({ message: 'Invalid request' });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id }).catch(() => null);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  task.completed = !task.completed;
  await task.save();
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id }).catch(() => null);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
