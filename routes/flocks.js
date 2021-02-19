const express = require('express');
const router = express.Router();
const db = require('../models');

// Cloudinary
const multer = require('multer');
const uploads = multer({ dest: './uploads' });
const cloudinary = require('cloudinary');
const isLoggedIn = require('../middleware/isLoggedIn');

// General get route for all flocks.
router.get('/:name', async(req, res) => {
    try {
        const name = req.params.name;
        const flock = await db.flock.findOne({
            where: { name },
            include: [db.member],
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
    
                res.render('./flocks', { flock, flocks, canMake: "flock and post", });
            } catch (error) {
                req.flash('error', "error when finding members");
                res.redirect('/');
            }
        } else {
            res.render('./flocks', { flock, flocks, canMake: "flock and post", });
        }
    } catch (error) {
        req.flash('error', 'Flock does not exist.');
        res.redirect('/feed');
    }
});

// General create route for flocks.
router.post('/', uploads.single('image'), isLoggedIn, async(req, res) => {
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
        console.log(error);
        req.flash('error', 'An error occured when creating a flock.');
        res.redirect('/feed');
    }
});


module.exports = router;