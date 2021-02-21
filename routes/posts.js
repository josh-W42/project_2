const express = require('express');
const canLike = require('../middleware/canLike');
const router = express.Router();
const db = require('../models');

router.post('/wings', canLike, async(req, res) => {
    const post = req.post;
    const userId = req.userId;
    const status = req.body.modifier === 'false' ? false : true;
    // Here we need to check if the user's username is found in post JSON of who has
    // pressed the up or down wing button.
    try {
        let hasWinged = false;
        let wingToDelete = null;
        post.wings.forEach(wing => {
            if (wing.userId === userId) {
                hasWinged = true;
                wingToDelete = wing;
            }
        });
        if (hasWinged) {
            await wingToDelete.destroy();
        } else {
            await post.createWing({ userId, status });
        }
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});


module.exports = router;