const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require("sequelize");

router.get('/', async(req, res) => {
    let query = req.query;

    // this is a basic search that just gives back everything.
    let userResults = await db.user.findAll({
        where: {
            userName: {
                [Op.substring]: query.value
            }
        }
    });

    let flockResults = await db.flock.findAll({
        where: {
            name: {
                [Op.substring]: query.value
            }
        }
    });

    userResults = userResults.map(user => user.userName);
    flockResults = flockResults.map(flock => flock.name);

    res.status(200).send({ userResults, flockResults });
});


module.exports = router;