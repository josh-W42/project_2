const express = require('express');
const isUpdatingSelf = require('../middleware/isUpdatingSelf');
const router = express.Router();
const db = require('../models');

// Cloudinary
const multer = require('multer');
const uploads = multer({ dest: './uploads' });
const cloudinary = require('cloudinary');

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

        let { id, firstName, lastName, imageUrl, bio, isPrivate, followers, createdAt } = user;
        let flocks = [];


        // get all posts related to the user
        const posts = await user.getPosts({
            include: [db.user, db.flock, db.wing]
        });
        // We have to load in information about the user if they are viewing their own profile.
        if (req.user && req.user.id === id) {
            try {
                console.log('lol');
                const promises = user.members.map(async member => await db.flock.findByPk(member.flockId));
                flocks = await Promise.all(promises);
    
                res.render('./users', { id, firstName, lastName, userName, imageUrl, bio, isPrivate, followers, createdAt, flocks, canMake: null, posts });
            } catch (error) {
                req.flash('error', "error when finding members");
                res.redirect('/');
            }
        } else {
            res.render('./users', { id, firstName, lastName, userName, imageUrl, bio, isPrivate, followers, createdAt, flocks, canMake: null, posts });
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
            console.log(error);
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

        await user.destroy();
        req.flash('success', `Account Deleted. Goodbye, ${req.params.userName}.`);
        res.redirect('/feed');
    } catch (error) {
        req.flash('error', 'An error occured when deleting. Please try again.');
        res.redirect(`/users/${req.params.userName}`);
    }
});

// Unknown get routes.
router.get('*', (req, res) => {
    req.flash('error', "Page does not exist.");
    res.status(404).redirect('/');
});

module.exports = router;