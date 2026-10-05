const db = require('./setup');
const { api, signup, auth } = require('./helpers');

beforeAll(db.start); afterAll(db.stop); beforeEach(db.clear);

describe('JWT authentication', () => {
  test('register returns a token', async () => {
    const res = await api().post('/api/auth/register')
      .send({ name: 'A', email: 'a@t.com', password: 'secret123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
  });

  test('register rejects duplicate email and short password', async () => {
    await signup('dup@t.com');
    expect((await api().post('/api/auth/register')
      .send({ name: 'A', email: 'dup@t.com', password: 'secret123' })).status).toBe(409);
    expect((await api().post('/api/auth/register')
      .send({ name: 'A', email: 'new@t.com', password: '123' })).status).toBe(400);
  });

  test('login works with the right password, fails with the wrong one', async () => {
    await signup('l@t.com');
    expect((await api().post('/api/auth/login').send({ email: 'l@t.com', password: 'secret123' })).status).toBe(200);
    expect((await api().post('/api/auth/login').send({ email: 'l@t.com', password: 'wrong' })).status).toBe(401);
  });

  test('protected routes reject a missing token', async () => {
    expect((await api().get('/api/tasks')).status).toBe(401);
    expect((await api().post('/api/tasks').send({ title: 'x' })).status).toBe(401);
  });

  test('protected routes reject an invalid token', async () => {
    expect((await api().get('/api/tasks').set(auth('garbage'))).status).toBe(401);
  });

  test('valid token reaches /me', async () => {
    const { token } = await signup();
    expect((await api().get('/api/auth/me').set(auth(token))).status).toBe(200);
  });
});
