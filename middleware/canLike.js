const db = require("../models");

const canLike = async(req, res, next) => {
    try {
        const user = await db.user.findByPk(req.body.userId);
        const post = await db.post.findByPk(req.body.postId);
        if (!user) {
            throw new Error('Invalid Permissions');
        } else if (!post) {
            throw new Error('Post not found');
        } else {
            req.post = post;
            req.user = user;
            next();
        }
    } catch (error) {
        res.sendStatus(500);
    }
}

 module.exports = canLike;