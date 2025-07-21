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

    // ✅ Already clicked today
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

    if (diffInDays === 1) {
      streak.streakCount += 1;
      streak.missedYesterday = false;
    } else if (diffInDays === 2 && streak.missedYesterday) {
      streak.streakCount = 0;
      streak.missedYesterday = false;
    } else if (diffInDays >= 2) {
      streak.streakCount = 1;
      streak.missedYesterday = false;
    }

    // ✅ Handle missed yesterday only if user skipped yesterday and updates today
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    const hasClickedYesterday = streak.history?.some(d => {
      const histDate = new Date(d);
      return (
        histDate.getFullYear() === yDate.getFullYear() &&
        histDate.getMonth() === yDate.getMonth() &&
        histDate.getDate() === yDate.getDate()
      );
    });

    if (!hasClickedYesterday && diffInDays === 2) {
      streak.missedYesterday = true;
    } else {
      streak.missedYesterday = false;
    }

    streak.lastOpened = today;
    streak.history = [...(streak.history || []), todayDate]; // Keep a record

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
