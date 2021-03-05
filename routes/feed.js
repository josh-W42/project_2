const express = require('express');
const router = express.Router();
const db = require('../models');

router.get('/', async(req, res) => {

    let posts = await db.post.findAll({
        order: [['createdAt', 'DESC']],
        include: [db.user, db.flock, db.wing, db.comment]
    });

    let flocks = [];
    if (req.user) {
        try {
            const user = await db.user.findByPk(req.user.id, {
                include: [db.member],
            });
            const promises = user.members.map(async member => await db.flock.findByPk(member.flockId));
            flocks = await Promise.all(promises);

            res.render('./feed', { flocks, role: 'viewer', canMake: "flock", posts });
        } catch (error) {
            req.flash('error', "error when finding members");
            res.redirect('/');
        }
    } else {
        res.render('./feed', { flocks, role: 'viewer', canMake: "flock", posts });
    }
});

// Unknown get routes.
router.get('*', (req, res) => {
    req.flash('error', "Page does not exist.");
    res.status(404).redirect('/');
});

module.exports = router;