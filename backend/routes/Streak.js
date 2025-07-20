const express = require('express');
const router = express.Router();
const streakController = require("../controllers/streakController")

//Streak
router.post('/update', streakController.updateStreak);
router.get('/get', streakController.getStreak);

module.exports = router;