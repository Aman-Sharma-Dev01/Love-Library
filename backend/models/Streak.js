const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  streakCount: { type: Number, default: 0 },
  lastOpened: { type: Date },
  missedYesterday: { type: Boolean, default: false },
});

module.exports = mongoose.model('Streak', streakSchema);
