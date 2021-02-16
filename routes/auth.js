const express = require('express');
const passport = require('passport');
const router = express.Router();
const db = require('../models');

// Cloudinary
const multer = require('multer');
const uploads = multer({ dest: './uploads' });
const cloudinary = require('cloudinary');

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.get('/logout', (req, res) => {
  req.logOut();
  // Good practice to do something when you're logged out. So we'll send a flash message and then redirect.
  req.flash('success', 'Successfuly Logged out.');
  res.redirect('/');
});

// New type of post route using  passport, we essentially let passport do the heavy work on authenicating users.
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  successFlash: `Successfully Logged In.`,
  failureRedirect: '/auth/login',
  failureFlash: `Email or password is incorrect. Please try again.`
}));

// different than login, we have to add to or check the database.
router.post('/signup', uploads.single('image'), async(req, res) => {
  let { email, password, userName, firstName, lastName, isPrivate } = req.body;
  // Check private value
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

  try {
    const [user, created] = await db.user.findOrCreate({
      where: { email },
      defaults: { firstName, lastName, password, userName, isPrivate, imageUrl }
    });

    if (created) {
      // If the user was created, then take them to the homepage to view content.
      // next we can send a flash message.
      const successObject = {
        successRedirect: '/',
        successFlash: `Welcome ${user.userName}. Account created successfuly.`
      }
      // password authenicate
      passport.authenticate('local', successObject)(req, res);
    } else {
      req.flash('error', 'Email already exists');
      res.redirect('/auth/signup');
    }
  } catch (error) {
    console.log('\n############## ERROR:\n');
    console.log('An error has occured when accessing the database: ');
    console.log(error);
    console.log('\n############## END \n');  
  
    req.flash('error', 'Email or password is incorrect. Please try again');
    res.redirect('/auth/signup');
  }
});

module.exports = router;
