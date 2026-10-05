const db = require('./setup');
const { api, signup, auth } = require('./helpers');

beforeAll(db.start); afterAll(db.stop); beforeEach(db.clear);

const create = (token, body) => api().post('/api/tasks').set(auth(token)).send(body);

describe('task CRUD', () => {
  test('create then list own tasks', async () => {
    const { token } = await signup();
    const res = await create(token, { title: 'Write report', priority: 'high' });
    expect(res.status).toBe(201);
    const list = await api().get('/api/tasks').set(auth(token));
    expect(list.body).toHaveLength(1);
    expect(list.body[0].title).toBe('Write report');
  });

  test('title is required', async () => {
    const { token } = await signup();
    expect((await create(token, { description: 'no title' })).status).toBe(400);
  });

  test('edit a task', async () => {
    const { token } = await signup();
    const t = (await create(token, { title: 'Old' })).body;
    const res = await api().put(`/api/tasks/${t._id}`).set(auth(token)).send({ title: 'New' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New');
  });

  test('toggle complete', async () => {
    const { token } = await signup();
    const t = (await create(token, { title: 'Do it' })).body;
    const res = await api().patch(`/api/tasks/${t._id}/toggle`).set(auth(token));
    expect(res.body.completed).toBe(true);
  });

  test('delete a task', async () => {
    const { token } = await signup();
    const t = (await create(token, { title: 'Gone' })).body;
    expect((await api().delete(`/api/tasks/${t._id}`).set(auth(token))).status).toBe(200);
    expect((await api().get('/api/tasks').set(auth(token))).body).toHaveLength(0);
  });

  test('filter by completed, priority and search text', async () => {
    const { token } = await signup();
    await create(token, { title: 'Buy milk', priority: 'low' });
    const done = (await create(token, { title: 'Pay rent', priority: 'high' })).body;
    await api().patch(`/api/tasks/${done._id}/toggle`).set(auth(token));
    const get = (qs) => api().get(`/api/tasks?${qs}`).set(auth(token));
    expect((await get('completed=true')).body).toHaveLength(1);
    expect((await get('priority=low')).body[0].title).toBe('Buy milk');
    expect((await get('q=RENT')).body).toHaveLength(1);
  });
});

describe('per-user data isolation', () => {
  test('users only see their own tasks', async () => {
    const a = await signup(); const b = await signup();
    await create(a.token, { title: 'A secret' });
    expect((await api().get('/api/tasks').set(auth(b.token))).body).toHaveLength(0);
  });

  test("cannot edit, toggle or delete another user's task", async () => {
    const a = await signup(); const b = await signup();
    const t = (await create(a.token, { title: 'Mine' })).body;
    expect((await api().put(`/api/tasks/${t._id}`).set(auth(b.token)).send({ title: 'Hacked' })).status).toBe(404);
    expect((await api().patch(`/api/tasks/${t._id}/toggle`).set(auth(b.token))).status).toBe(404);
    expect((await api().delete(`/api/tasks/${t._id}`).set(auth(b.token))).status).toBe(404);
    const still = await api().get('/api/tasks').set(auth(a.token));
    expect(still.body[0].title).toBe('Mine');
  });

  test('a user id sent in the body is ignored', async () => {
    const a = await signup(); const b = await signup();
    const me = (await api().get('/api/auth/me').set(auth(b.token))).body.user;
    await api().post('/api/tasks').set(auth(a.token)).send({ title: 'Spoof', user: me._id });
    expect((await api().get('/api/tasks').set(auth(b.token))).body).toHaveLength(0);
    expect((await api().get('/api/tasks').set(auth(a.token))).body).toHaveLength(1);
  });
});
