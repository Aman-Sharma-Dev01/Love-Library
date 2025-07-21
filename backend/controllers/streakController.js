const Streak = require('../models/Streak');

exports.updateStreak = async (req, res) => {
  try {
    let streak = await Streak.findOne();

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (!streak) {
      streak = new Streak({
        streakCount: 1,
        lastOpened: today,
        missedYesterday: false,
        history: [todayDate]
      });
      await streak.save();
      return res.json({ message: "Streak started", streak: 1, missedYesterday: false });
    }

    const lastOpenedDate = streak.lastOpened
      ? new Date(streak.lastOpened.getFullYear(), streak.lastOpened.getMonth(), streak.lastOpened.getDate())
      : null;

    if (lastOpenedDate && lastOpenedDate.getTime() === todayDate.getTime()) {
      return res.json({
        message: "Already updated for today",
        streak: streak.streakCount,
        missedYesterday: streak.missedYesterday
      });
    }

    const diffInDays = lastOpenedDate
      ? (todayDate - lastOpenedDate) / (1000 * 60 * 60 * 24)
      : null;

    // Main streak logic
    if (diffInDays === 1) {
      // Consecutive day
      streak.streakCount += 1;
      streak.missedYesterday = false;
    } else if (diffInDays === 2) {
      // Missed exactly 1 day → allow
      streak.missedYesterday = true;
      // Don’t increment or reset streakCount
    } else if (diffInDays > 2) {
      // Missed 2 or more days → reset
      streak.streakCount = 1;
      streak.missedYesterday = false;
    }

    // Update history
    streak.lastOpened = today;
    streak.history = [...(streak.history || []), todayDate];

    await streak.save();

    res.json({
      message: "Streak updated",
      streak: streak.streakCount,
      missedYesterday: streak.missedYesterday
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update streak" });
  }
};



exports.getStreak = async (req, res) => {
  const streak = await Streak.findOne();
  if (!streak) return res.json({ streak: 0, missedYesterday: false });
  res.json({ streak: streak.streakCount, missedYesterday: streak.missedYesterday });
};
