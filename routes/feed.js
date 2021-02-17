const express = require('express');
const passport = require('passport');
const router = express.Router();
const db = require('../models');

router.get('/', (req, res) => {
    res.render('./feed');
});

module.exports = router;