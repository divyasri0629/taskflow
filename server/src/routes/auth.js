const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'Name, email and a 6+ character password are required' });
  if (await User.findOne({ email: String(email).toLowerCase() }))
    return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: sign(user), user: { id: user._id, name: user.name, email: user.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matches(password || '')))
    return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: sign(user), user: { id: user._id, name: user.name, email: user.email } });
});

router.get('/me', protect, (req, res) => res.json({ user: req.user }));

module.exports = router;
