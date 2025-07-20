const Streak = require('../models/Streak');

exports.updateStreak = async (req, res) => {
  try {
    let streak = await Streak.findOne();

    if (!streak) {
      // Create one if not exists
      streak = new Streak({
        streakCount: 1,
        lastOpened: new Date(),
        missedYesterday: false
      });
      await streak.save();
      return res.json({ message: "Streak started", streak: 1 });
    }

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const lastOpenedDate = streak.lastOpened
      ? new Date(streak.lastOpened.getFullYear(), streak.lastOpened.getMonth(), streak.lastOpened.getDate())
      : null;

    if (lastOpenedDate && lastOpenedDate.getTime() === todayDate.getTime()) {
      return res.json({ message: "Already updated for today", streak: streak.streakCount });
    }

    if (lastOpenedDate) {
      const diffInDays = (todayDate - lastOpenedDate) / (1000 * 60 * 60 * 24);

      if (diffInDays === 1) {
        streak.streakCount += 1;
        streak.missedYesterday = false;
      } else if (diffInDays === 2 && streak.missedYesterday) {
        streak.streakCount = 0;
        streak.missedYesterday = false;
      } else {
        streak.streakCount = 1;
        streak.missedYesterday = false;
      }
    } else {
      streak.streakCount = 1;
    }

    // Clock icon logic
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    if (lastOpenedDate && lastOpenedDate.getTime() === yDate.getTime()) {
      streak.missedYesterday = true;
    }

    streak.lastOpened = today;
    await streak.save();

    res.json({ message: "Streak updated", streak: streak.streakCount });
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
