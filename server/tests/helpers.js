const request = require('supertest');
const app = require('../src/app');

exports.api = () => request(app);

exports.signup = async (email = `u${Date.now()}${Math.random()}@t.com`) => {
  const res = await request(app).post('/api/auth/register')
    .send({ name: 'User', email, password: 'secret123' });
  return { token: res.body.token, email };
};

exports.auth = (token) => ({ Authorization: `Bearer ${token}` });
