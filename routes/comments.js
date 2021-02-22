const express = require('express');
const canLike = require('../middleware/canLike');
const router = express.Router();
const db = require('../models');

router.post('/wings', canLike, async(req, res) => {
    const userId = req.userId;
    const status = req.body.status === 'false' ? false : true;
    const commentId = parseInt(req.body.commentId);
    // Here we need to check if the user's username is found in post JSON of who has
    // pressed the up or down wing button.
    try {
        const comment = await db.comment.findByPk(commentId, {
            include: [db.wing]
        });

        if (!comment) {
            req.flash('No comment found.');
            throw new Error('No comment found');
        }

        let hasWinged = false;
        let wingToDelete = null;
        comment.wings.forEach(wing => {
            if (wing.userId === userId) {
                hasWinged = true;
                wingToDelete = wing;
            }
        });
        if (hasWinged) {
            await wingToDelete.destroy();
        } else {
            await comment.createWing({ userId, status });
        }
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});


module.exports = router;