const db = require("../models");

const canLike = async(req, res, next) => {
    try {
        const userId = parseInt(req.body.viewerId);
        const postId = parseInt(req.body.postId);
        const user = await db.user.findByPk(userId);
        const post = await db.post.findByPk(postId, {
            include: [db.wing]
        });
        if (!user) {
            throw new Error('Invalid Permissions');
        } else if (!post) {
            throw new Error('Post not found');
        } else {
            req.post = post;
            req.userId = user.id;
            next();
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

 module.exports = canLike;