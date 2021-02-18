const express = require('express');
const passport = require('passport');
const isLoggedIn = require('../middleware/isLoggedIn');
const router = express.Router();
const db = require('../models');

router.get('/:userName', async(req, res) => {
    try {
        const userName = req.params.userName;
        const user = await db.user.findOne({ where: { userName } });
        const { id, firstName, lastName, imageUrl, bio, isPrivate, createdAt} = user;
        res.render('./users', { id, firstName, lastName, userName, imageUrl, bio, isPrivate, createdAt });
    } catch (error) {
        req.flash('error', 'User does not exist');
        res.redirect(`/`);
    }
});

module.exports = router;