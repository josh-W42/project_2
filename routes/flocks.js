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
        let posts = await flock.getPosts({
            order: [['createdAt', 'ASC']],
            include: [db.user, db.flock, db.wing]
        });

        // Get all members
        const memberPromises = flock.members.map( async member => {
            const user = await db.user.findByPk(member.userId);
            return { id: member.id, userName: user.userName, role: member.role }
        });
        flock.members = await Promise.all(memberPromises);

        // for user navigation
        let flocks = [];
        if (req.user) {
            try {
                const user = await db.user.findByPk(req.user.id, {
                    include: [db.member],
                });
                const userPromises = user.members.map(async member => await db.flock.findByPk(member.flockId));
                const flocks = await Promise.all(userPromises);

                // Check if user is a member of the flock. and get their role.
                let role = "non-member";
                let isMember = false;
                flock.members.forEach(member => {
                    if (member.id === user.id) {
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

// DELETE route for flocks
router.delete('/:name/delete', canEditFlock, async(req, res) => {
    // Adjust private value
    const flock = req.flock; // from canEditFlock

    try {
        // first delete all members associated with flock
        flock.members.forEach(async member => {
            await member.destroy();
        });
        // then delete all posts
        flock.posts.forEach(async post => {
            await post.destroy();
        });
    
        await flock.destroy();
    
        req.flash('success', `Flock Deleted. Goodbye, ${req.params.name}.`);
        res.redirect('/feed');
    } catch (error) {
        req.flash('error', 'An error occured when deleting. Please try again.');
        res.redirect(`/feed`);
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
        });
        res.redirect(`/flocks/${name}`);
    } catch (error) {
        req.flash('error', `Couldn't create post, please try again.`);
        res.redirect(`/flocks/${name}`);
    }
});

// For Joining a flock
router.post('/:name/m/:userId', isLoggedIn, async(req, res) => {
    let name = req.params.name;
    let userId = parseInt(req.params.userId);
    // flock lookup
    try {
        const flock = await db.flock.findOne({ where: { name }});
        // add a member
        try {
            await flock.createMember({
                role: 'member',
                userId
            });
            req.flash('success', `Welcome to the ${req.params.name}`);
            res.redirect(`/flocks/${req.params.name}`);
        } catch (error) {
            req.flash('error', `Couldn't add a member.`);
            res.redirect(`/flocks/${req.params.name}`);
        }
    } catch (error) {
        req.flash('error', 'Flock does not exist.');
        res.redirect(`/feed`);
    }
});

// For Leaving a flock
router.delete('/:name/m/:userId', isLoggedIn, async(req, res) => {
    let name = req.params.name; 
    let userId = parseInt(req.params.userId);

    try {
        const flock = await db.flock.findOne({ 
            where: { name },
            include: [db.member, db.post]
        });
        // delete a member, if found

        let member = flock.members.find(member => member.userId === userId);

        if (member) {
            await member.destroy();
            
            // Lastly, if there there are no more members of a flock, it will delete itself.
            if (flock.members.length === 1) {

                // delete all posts rows with this flock.
                flock.posts.forEach(async post => {
                    await post.destroy();
                });

                await flock.destroy();
            }
            req.flash('success', `Successfuly left flock, ${req.params.name}`);
            res.redirect(`/feed`);

        } else {
            req.flash('error', 'You are not a member of this flock.');
            res.redirect(`/flocks/${req.params.name}`);
        }

    } catch (error) {
        req.flash('error', 'Flock does not exist.');
        res.redirect(`/feed`);
    }
});

// For making an admin
router.put('/:name/m/:memberId/admin/add', canEditFlock, async (req, res) => {
    const flock = req.flock;
    const memberId = parseInt(req.params.memberId);

    try {
        // search for member
        const member = flock.members.find((member => member.id === memberId));
        console.log(member, memberId);
        // change role
        member.role = 'admin';
        await member.save();

        req.flash('success', `Member Promoted To Admin`);
        res.redirect(`/flocks/${flock.name}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Could Not Promote Member');
        res.redirect(`/flocks/${flock.name}`);
    }
});

// Get a specific post and it's comments
// *** also, unsure if I can make another
// controller for this but for now i'm putting it here.
router.get('/:name/p/:postId', async(req, res) => {
    const name = req.params.name;
    const postId = parseInt(req.params.postId);
    // Check of the flock and post exist
    try {
        const flock = await db.flock.findOne({
            where: { name },
            include: [db.member]
        });
        if (!flock) {
            req.flash('error', 'Flock does not exist.');
            throw new Error('Non existant.');
        }
        
        // Get all members
        const memberPromises = flock.members.map( async member => {
            const user = await db.user.findByPk(member.userId);
            return { id: member.id, userName: user.userName, role: member.role }
        });
        flock.members = await Promise.all(memberPromises);

        const post = await db.post.findByPk(postId, {
            include: [db.wing]
        });
        if (!post) {
            req.flash('error', 'Post does not exist in flock.');
            throw new Error('Non existant');
        }

        const comments = await post.getComments({
            order: [['createdAt', 'ASC']],
            include: [db.wing, db.user]
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
                    if (member.id === user.id) {
                        isMember = true;
                        role = member.role;
                    }
                });
                res.render(`flocks/post`, { flock, flocks, post, isMember, role, canMake: "flock and post", comments });
            } catch (error) {
                req.flash('error', "error when finding members");
                res.redirect('/');
            }
        } else {
            res.render(`flocks/post`, { flock, flocks, post, role: "non-member", isMember: false, canMake: "flock and post", comments });
        }
    } catch (error) {
        res.redirect('/feed');
    }
});

// Add a comment
router.post('/:name/p/:postId', canPost, async(req, res) => {
    const postId = parseInt(req.params.postId);
    const flock = req.flock;

    // First we have to get the post
    try {
        const post = await db.post.findByPk(postId);

        if (!post) {
            req.flash('error', 'Post does not exist.');
            throw new Error('Post does not exist.');
        }

        // next we add a comment
        const comment = await post.createComment({
            userId: req.user.id,
            content: req.body.content,
        });
        res.redirect(`/flocks/${flock.name}/p/${postId}`);

    } catch (error) {
        res.redirect(`/flocks/${flock.name}`);
    }
});

// Delete a Comment
router.delete('/:name/p/:postId/c/:commentId', canPost, async (req, res) => {
    const postId = parseInt(req.params.postId);
    const flock = req.flock;
    const commentId = parseInt(req.params.commentId);

    try {
        const comment = await db.comment.findByPk(commentId);

        // Delete a comment if found.
        if (comment) {
            await comment.destroy();

            req.flash('success', `Successfuly Deleted Comment.`);
            res.redirect(`/flocks/${flock.name}/p/${postId}`);
        } else {
            req.flash('error', 'Could Not Delete Comment.');
            res.redirect(`/flocks/${flock.name}/p/${postId}`);
        }

    } catch (error) {
        req.flash('error', 'Comment Does Not Exist.');
        res.redirect(`/flocks/${flock.name}/p/${postId}`);
    }    

});

// Unknown get routes.
router.get('*', (req, res) => {
    req.flash('error', "Page does not exist.");
    res.status(404).redirect('/');
});


module.exports = router;