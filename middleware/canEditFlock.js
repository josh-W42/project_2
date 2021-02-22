const db = require("../models");

const canEditFlock = async(req, res, next) => {
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
                include: [db.member, db.post]
            });
            if (!flock) {
                throw new Error('No flock found.');
            }

            let hasPermisions = false;
            flock.members.forEach(member => {
                if (member.userId === id && member.role !== 'member') {
                    hasPermisions = true;
                }
            });

            if (hasPermisions) {
                req.flock = flock;
                next();
            } else {
                throw new Error('Not a member or not admin.');
            }
        } catch (error) {
            req.flash('error', "Invalid Permisions.");
            res.redirect(`/flocks/${req.params.name}`);
        }
    }
}
 module.exports = canEditFlock;