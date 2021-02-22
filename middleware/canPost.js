const db = require("../models");

const canPost = async(req, res, next) => {
    // This is to make sure that a user is posting into a group they are apart of.

    if (!req.user) {
        req.flash('error', "Invalid Permisions.");
        res.redirect('/auth/login');
    } else {
        // Usernames have to be unique so we can check the request userName vs the logged in userName
        const currentUser = req.user.get();
        const id = currentUser.id;
        const name = req.params.name;
        
        try {
            const flock = await db.flock.findOne({ 
                where: { name },
                include: [db.member]
            });
            if (!flock) {
                req.flash('error', 'Flock does not exist.');
                throw new Error('No flock found.');
            }
            
            if (flock.members.find(member => member.userId === id)) {
                req.flock = flock;
                next();
            } else {
                req.flash('error', 'You are not a member of this flock.');
                throw new Error('Not a member.');
            }
        } catch (error) {
            res.redirect(`/flocks/${req.params.name}`);
        }
    }
}
 module.exports = canPost;