const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const upload = require('../upload/upload');
const sharp = require('sharp');
const {sendWelcomeEmail,sendByeEmail} = require('../emails/account');

const router = new express.Router();




router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email,user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
})
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);

    }

})
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send();

    }
})
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        console.log(req.user);
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send();

    }

})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ height: 250, width: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    try {
        await req.user.save();
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
    }
})
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.sendStatus(404);
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedOptions = ['name', 'email', 'password', 'age'];
    const isValidOption = updates.every((update) => allowedOptions.includes(update));
    if (!isValidOption) return res.status(400).send({ error: 'invalid updates' });
    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }

})
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendByeEmail(req.user.email,req.user.name);
        res.send(req.user)
    } catch (e) {
        res.status(500).send();
    }
})


module.exports = router;