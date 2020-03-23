const request = require('supertest');
const { setUpDB, user1, user1Id } = require('./fixtures/db')
const app = require('../src/app');
const User = require('../src/models/user');

beforeEach(setUpDB)

test('Should singup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'namma',
        email: 'namma@gmail.com',
        password: '12345678'
    }).expect(201);

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();
    expect(response.body).toMatchObject({
        user: {
            name: 'namma',
            email: 'namma@gmail.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('12345678');
});

test('Should login to user1', async () => {
    const response = await request(app).post('/users/login').send({
        email: user1.email,
        password: user1.password
    }).expect(200);
    const user = await User.findOne({ email: user1.email });
    expect(response.body.token).toBe(user.tokens[1].token)
});

test('Should login to noextinig user', async () => {
    await request(app).post('/users/login').send({
        email: "dddd",
        password: user1.password
    }).expect(400);
});

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Should not get profile for user that no auth', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('Should delet account for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200);
    const user = await User.findById(response.body._id);
    expect(user).toBeNull();
});

test('Should delet account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});

test('should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/images/profile-pic.jpg')
        .expect(200);
    const user = await User.findById(user1Id);
    expect(user.avatar).toEqual(expect.any(Buffer));

})

test('Should update valid user fields', async () => {
    const updates = {
        name: "moshe",
    }
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send(updates)
        .expect(200);
    const user = await User.findById(user1Id);
    expect(user.name).toEqual(updates.name);
});

test('Should update unvalid user fields', async () => {
    const updates = {
        location: "tirat carmel",
    }
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send(updates)
        .expect(400);
    const user = await User.findById(user1Id);
    expect(user.name).toEqual(user1.name);
});



