const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({ ...req.body, owner: req.user._id })
    try {
        await task.save();
        res.status(201).send(task)

    } catch (e) {
        res.status(400).send(e.message)
    }
})

//GET /tasks?completed=true
//GET /tasks?limit=10?skip=0
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    if (req.query.completed) {
        match.completed = req.query.completed === 'true' ? true : false;
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        task ? res.status(200).send(task) : res.status(404).send();
    } catch (e) {
        res.status(500).send();
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const allowedOptions = ["description", "completed"];
    const updates = Object.keys(req.body)
    const isValidOption = updates.every((update) => allowedOptions.includes(update));


    if (!isValidOption) return res.status(400).send({ error: 'invalid updates' });


    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task) res.status(404).send();
        updates.forEach((update) => task[update] = req.body[update])
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
})
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        task ? res.send(task) : res.sendStatus(404);
    } catch (e) {
        res.sendStatus(500)
    }
})


module.exports = router;