const express = require('express');
const isUpdatingSelf = require('../middleware/isUpdatingSelf');
const router = express.Router();
const db = require('../models');

// Cloudinary
const multer = require('multer');
const uploads = multer({ dest: './uploads' });
const cloudinary = require('cloudinary');
const isLoggedIn = require('../middleware/isLoggedIn');

// Get a user's homepage
router.get('/:userName', async(req, res) => {
    try {
        const userName = req.params.userName;
        const user = await db.user.findOne({ 
            where: { userName },
            include: [db.member]
        });

        // Check if user exists.
        if (!user) {
            throw new Error('User not found.');
        }

        let { id, firstName, lastName, imageUrl, bio, followers, following, isPrivate, createdAt } = user;
        let userData = { id, firstName, userName, lastName, followers, following, imageUrl, bio, isPrivate, createdAt };
        let flocks = [];

        // get all posts related to the user
        let posts = await user.getPosts({
            order: [['createdAt', 'ASC']],
            include: [db.user, db.flock, db.wing, db.comment]
        });

        // We have to load in information about the user if they are viewing their own profile.
        if (req.user) {
            try {
                const viewer = await db.user.findByPk(req.user.id, {
                    include: [db.member]
                });
                const promises = viewer.members.map(async member => await db.flock.findByPk(member.flockId));
                flocks = await Promise.all(promises);
    
                res.render('./users', { userData, flocks, role: 'viewer', canMake: null, posts });
            } catch (error) {
                req.flash('error', "error when finding members");
                res.redirect('/');
            }
        } else {
            res.render('./users', { userData, flocks, role: 'viewer', canMake: null, posts });
        }
    } catch (error) {
        req.flash('error', 'User does not exist');
        res.redirect(`/`);
    }
});
// An edit route for users.
router.put('/:userName/edit', isUpdatingSelf, uploads.single('image'), async(req, res) => {
    let { email, userName, firstName, lastName, isPrivate, bio } = req.body;
    let { id } = req.user.get();
    // Check private value
    isPrivate = isPrivate ? true : false;

    // Now we check what is changed
    try {
        const user = await db.user.findByPk(id);

        // Keep track of important changes.
        let userNameChanged = false;
        
        // Throw errors for unique values.
        if (user.email !== email) {
            const testCount = await db.user.count({ where: { email }});
            if (testCount > 0) {
                throw new Error('A user with that email already exists.');
            }
        }
        if (user.userName !== userName) {
            const testCount = await db.user.count({ where: { userName }});
            if (testCount > 0) {
                throw new Error("We're sorry, but that username is taken.");
            }
            userNameChanged = true;
        }
        user.email = email;
        user.userName = userName;
        user.firstName = firstName;
        user.lastName = lastName;
        user.isPrivate = isPrivate;
        user.bio = bio;

        // Check if user inputed an image and process it.
        if (req.file) {
            image = req.file.path;
            try {
                const result = await cloudinary.uploader.upload(image);
                user.imageUrl = result.secure_url;
            } catch (error) {
                req.flash('error', 'Could not upload image at this time.');
            }
        }

        req.flash('success', 'Profile edited successfully.');
        if (userNameChanged) {
            res.redirect(`/users/${user.userName}`);
        } else {
            res.redirect(`/users/${req.params.userName}`);
        }
    

        // Lastly, save your work
        await user.save();
    } catch (error) {
        // For sequelize errors.
        if (error.errors) {
            error.errors.forEach(error => {
                req.flash('error', error.message);
            });
        } else {
            // Special errors that the user can change.
            req.flash('error', error.message);
        }
        res.redirect(`/users/${req.params.userName}`);
    }
});

// Delete a user.
router.delete('/:userName', isUpdatingSelf, async(req, res) => {
    try {
        const user = await db.user.findOne({ 
            where: { userName: req.params.userName },
            include: [db.member]
        });

        if (!user) {
            throw new Error('No user found');
        }

        // delete all member rows with this user id.
        user.members.forEach(async member => {
            await member.destroy();
        });

        // Now you just need to remove the deleted user's username from EVERY single user that is following them. Tisk Tisk... Ineffiecnt.
        user.followers.forEach(async followerUserName => {
            const foundUser = await db.user.findOne({ userName: followerUserName });
            foundUser.following = foundUser.following.filter( userName => userName !== user.userName);
            foundUser.save();
        });

        // Do the same for who they are following.
        user.following.forEach(async followingUser => {
            const foundUser = await db.user.findOne({ userName: followingUser.userName });
            foundUser.followers = foundUser.following.filter( userName => userName !== user.userName); 
            foundUser.save();
        });

        await user.destroy();
        req.flash('success', `Account Deleted. Goodbye, ${req.params.userName}.`);
        res.redirect('/feed');
    } catch (error) {
        req.flash('error', 'An error occured when deleting. Please try again.');
        res.redirect(`/users/${req.params.userName}`);
    }
});

// Follow another user
router.put('/:userId/follow', isLoggedIn, async (req, res) => {
    const userId = parseInt(req.params.userId); // user 1 that the viewer is trying to follow.
    try {
        const user1 = await db.user.findByPk(userId);
        if (!user1) {
            throw new Error('user does not exist.');
        }
        // we have to also check if the viewer is already following user 1
        if (user1.followers.includes(req.user.userName)) {
            req.flash('error', 'Already following this user.');
            res.redirect(`/users/${user1.userName}`);
        } else {
            // Now just add user2's userName to user1 and save
            user1.followers = user1.followers.concat([req.user.userName]);
            await user1.save();
            // And we do the same for the viewer
            req.user.following = req.user.following.concat([user1.userName]);
            await req.user.save();
            req.flash('success', `You are now following ${user1.userName}`);
            res.redirect(`/users/${user1.userName}`);
        }
    } catch (error) {
        req.flash('error', 'User does not exist.');
        res.redirect('/feed');
    }
});

// Unfollow a user.
router.put('/:userId/unfollow', isLoggedIn, async (req, res) => {
    const userId = parseInt(req.params.userId); // user 1 that the viewer is trying to unfollow.
    try {
        const user1 = await db.user.findByPk(userId);
        if (!user1) {
            throw new Error('user does not exist.');
        }
        // we have to also check if the viewer has already unfollowed user 1
        if (!user1.followers.includes(req.user.userName)) {
            req.flash('error', `You're not following this user.`);
            res.redirect(`/users/${user1.userName}`);
        } else {
            // Now just remove user2's userName to user1 and save
            user1.followers = user1.followers.filter(follower => follower !== req.user.userName);
            await user1.save();
            // And we do the same for the viewer
            req.user.following = req.user.following.filter(follower => follower !== user1.userName);
            await req.user.save();
            req.flash('success', `You unfollowed, ${user1.userName}`);
            res.redirect(`/users/${user1.userName}`);
        }
    } catch (error) {
        req.flash('error', 'User does not exist.');
        res.redirect('/feed');
    }
});

// Unknown get routes.
router.get('*', (req, res) => {
    req.flash('error', "Page does not exist.");
    res.status(404).redirect('/');
});

module.exports = router;