const express = require('express');
const router = express.Router();
const db = require('../models');
const canPost = require('../middleware/canPost');
const isLoggedIn = require('../middleware/isLoggedIn');
const canEditFlock = require('../middleware/canEditFlock');

// Cloudinary
const multer = require('multer');
const uploads = multer({ dest: './uploads' });
const cloudinary = require('cloudinary');

// General get route for all flocks.
router.get('/:name', async(req, res) => {
    try {
        const name = req.params.name;
        const flock = await db.flock.findOne({
            where: { name },
            include: [db.member],
        });
        
        if (!flock) {
            throw new Error('flock does not exist');
        }

        // get all posts
        const posts = await flock.getPosts({
            include: [db.user, db.flock]
        });

        // for user navigation
        let flocks = [];
        if (req.user) {
            try {
                const user = await db.user.findByPk(req.user.id, {
                    include: [db.member],
                });
                const promises = user.members.map(async member => await db.flock.findByPk(member.flockId));
                const flocks = await Promise.all(promises);

                // Check if user is a member of the flock. and get their role.
                let role = "non-member";
                let isMember = false;
                flock.members.forEach(member => {
                    if (member.userId === user.id) {
                        isMember = true;
                        role = member.role;
                    }
                });
    
                res.render('./flocks', { flock, flocks, canMake: "flock and post", role, isMember, posts });
            } catch (error) {
                req.flash('error', "error when finding members");
                res.redirect('/');
            }
        } else {
            res.render('./flocks', { flock, flocks, canMake: "flock and post", isMember: false, role: "non-member", posts });
        }
    } catch (error) {
        req.flash('error', 'Flock does not exist.');
        res.redirect('/feed');
    }
});

// General create route for flocks.
router.post('/', isLoggedIn, uploads.single('image'), async(req, res) => {
    let { name, description, isPrivate } = req.body;
    // Adjust private value
    isPrivate = isPrivate ? true : false;

    // First see if you can process the image.
    // Check if user inputed an image.
    let image = undefined;
    let imageUrl = undefined;
    if (req.file) {
        image = req.file.path;
        try {
            const result = await cloudinary.uploader.upload(image);
            imageUrl = result.secure_url;
        } catch (error) {
            req.flash('error', 'Could not upload image at this time. Using default.');
            imageUrl = "https://res.cloudinary.com/dom5vocai/image/upload/v1613426540/crane_logo_xzo7cm.png";
        }
    } else {
        imageUrl = "https://res.cloudinary.com/dom5vocai/image/upload/v1613426540/crane_logo_xzo7cm.png";
    }

    // Now we have to create the flock.
    try {
        // Use find or create to check flock uniqueness.
        const [flock, created] = await db.flock.findOrCreate({
            where: { name },
            defaults: { description, isPrivate, imageUrl }
        });

        if (created) {
            // If a flock is created, make the current user a member with
            // the role of owner.
            await flock.createMember({
                role: 'owner',
                userId: req.user.id,
            });

            req.flash('success', `The ${name} flock has been created.`);
            res.redirect(`/flocks/${name}`);
        } else {
            req.flash('error', 'A flock with that name already exists.');
            res.redirect('/feed');
        }
    } catch (error) {
        if (error.errors) {
            error.errors.forEach(error => {
              req.flash('error', error.message);
            });
          } else {
            req.flash('error', 'An error occured when creating a flock.');
          }
        res.redirect('/feed');
    }
});

// PUT route for editing a flock.
router.put('/:name/edit', canEditFlock, uploads.single('image'), async(req, res) => {
    let { name, description, isPrivate } = req.body;
    // Adjust private value
    isPrivate = isPrivate ? true : false;
    const flock = req.flock; // from canEditFlock

    // Check what's changed
    try {
        let nameChanged = false;

        // Throw errors for unique values.
        if (flock.name !== name) {
            const testCount = await db.user.count({ where: { name }});
            if (testCount > 0) {
                throw new Error('A flock with that name already exists.');
            }
        }

        flock.name = name;
        flock.description = description;
        flock.isPrivate = isPrivate;

        // Check if user inputed an image and process it.
        if (req.file) {
            image = req.file.path;
            try {
                const result = await cloudinary.uploader.upload(image);
                flock.imageUrl = result.secure_url;
            } catch (error) {
                req.flash('error', 'Could not upload image at this time.');
            }
        }        

        req.flash('success', 'Flock edited successfully.');
        if (nameChanged) {
            res.redirect(`/flocks/${flock.name}`);
        } else {
            res.redirect(`/flocks/${req.params.name}`);
        }
    
        // Lastly, save your work
        await flock.save();
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
        res.redirect(`/flocks/${req.params.name}`);
    }
});

// POST route for when a user makes a new post.
router.post('/:name/p', canPost, uploads.single('image'), async(req, res) => {
    const { content } = req.body;
    const name = req.params.name;
    const flock = req.flock; // From canPost.

    // Check if user inputed an image.
    let image = undefined;
    let imageUrl = null;
    if (req.file) {
      image = req.file.path;
      try {
        const result = await cloudinary.uploader.upload(image);
        imageUrl = result.secure_url;
      } catch (error) {
        req.flash('error', 'Could not upload image at this time.');
      }
    }

    try {
        await flock.createPost({
            poster: req.user.userName,
            content,
            imageUrl,
            userId: req.user.id,
            wings: 0,
            hasWinged: JSON.stringify({})
        });
        res.redirect(`/flocks/${name}`);
    } catch (error) {
        req.flash('error', `Couldn't create post, please try again.`);
        res.redirect(`/flocks/${name}`);
    }
});

// Unknown get routes.
router.get('*', (req, res) => {
    req.flash('error', "Page does not exist.");
    res.status(404).redirect('/');
});


module.exports = router;