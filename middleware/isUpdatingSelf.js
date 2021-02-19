const isUpdatingSelf = (req, res, next) => {
    // This is to make sure that a user is making changes to their own data
    // and not someone elses.

    if (!req.user) {
        req.flash('error', "Invalid Permisions.");
        res.redirect('/auth/login');
    } else {
        // Usernames have to be unique so we can check the request userName vs the logged in userName
        const currentUser = req.user.get();
        const userName = currentUser.userName;
        const otherUsername = req.params.userName;

        if (userName === otherUsername) {
            next();
        } else {
            req.flash('error', "Invalid Permisions.");
            res.redirect('/auth/login');
        }
    }
}
 module.exports = isUpdatingSelf;