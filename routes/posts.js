const express = require('express');
const canLike = require('../middleware/canLike');
const router = express.Router();
const db = require('../models');

router.put('/wings', canLike, async(req, res) => {
    const post = req.post;
    // Here we need to check if the user's username is found in post JSON of who has
    // pressed the up or down wing button.
    try {
        const hasWingedJson = JSON.parse(post.hasWinged);
        post.wings = parseInt(req.body.wings);
        if (hasWingedJson[`${req.user.userName}`] === undefined) {
            const status = req.body.status === 'false' ? false : true;
            hasWingedJson[`${req.user.userName}`] = status;
        } else {
            delete hasWingedJson[`${req.user.userName}`];
        }
        post.hasWinged = JSON.stringify(hasWingedJson);
        await post.save();
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});


module.exports = router;