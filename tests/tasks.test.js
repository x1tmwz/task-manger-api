const request = require('supertest');
const Task = require('../src/models/task');
const app = require('../src/app');
const { setUpDB, user1, user1Id ,user2,user2Id,task3} = require('./fixtures/db');



beforeEach(setUpDB)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({
            description: 'work on my shesh besh'
        })
        .expect(201)
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
})

test('Should create get task get only task for auth user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(2);
    
})

test('Should user1 delet user2 tasks', async () => {
    await request(app)
        .delete(`/tasks/${task3._id}`)
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(task3._id);
    expect(task).not.toBeNull();
    
})

