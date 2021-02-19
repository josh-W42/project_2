const express = require('express');
const isUpdatingSelf = require('../middleware/isUpdatingSelf');
const router = express.Router();
const db = require('../models');

// Cloudinary
const multer = require('multer');
const uploads = multer({ dest: './uploads' });
const cloudinary = require('cloudinary');
const passport = require('passport');

router.get('/:userName', async(req, res) => {
    try {
        const userName = req.params.userName;
        const user = await db.user.findOne({ where: { userName } });
        let { id, firstName, lastName, imageUrl, bio, isPrivate, followers, createdAt } = user;
        res.render('./users', { id, firstName, lastName, userName, imageUrl, bio, isPrivate, followers, createdAt });
    } catch (error) {
        req.flash('error', 'User does not exist');
        res.redirect(`/`);
    }
});

router.put('/:userName/edit', uploads.single('image'), isUpdatingSelf, async(req, res) => {
    let { email, userName, firstName, lastName, isPrivate } = req.body;
    let { id } = req.user.get();
    // Check private value
    isPrivate = isPrivate ? true : false;

    // Now we check what is changed
    try {
        const user = await db.user.findByPk(id);

        // Keep track of important changes.
        let emailChanged = false;
        let userNameChanged = false;
        
        // Throw errors for unique values.
        if (user.email !== email) {
            const testCount = await db.user.count({ where: { email }});
            if (testCount > 0) {
                throw new Error('A user with that email already exists.');
            }
            emailChanged = true;
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

        
        if (emailChanged) {
            const tryObject = {
                successRedirect: `/users/${req.params.userName}`,
                successFlash: `Profile edited successfully.`,
                failureRedirect: `/users/${req.params.userName}`,
                failureFlash: `An error occured when updating, please try again.`
            }
            passport.authenticate('local', tryObject)(req, res);
        } else {
            req.flash('success', 'Profile edited successfully.');
            if (userNameChanged) {
                res.redirect(`/users/${user.userName}`);
            } else {
                res.redirect(`/users/${req.params.userName}`);
            }
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

module.exports = router;