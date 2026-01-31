import React, { useEffect, useState } from "react";
import "./CuteCard.css";

// Romantic and motivational quotes collection
const quotes = [
  "You're my favorite notification",
  "Every love story is beautiful, but ours is my favorite",
  "In a sea of people, my eyes will always search for you",
  "You are my today and all of my tomorrows",
  "Together is a wonderful place to be",
  "Love is not about how many days, it's about how much you love each day",
  "You make my heart smile",
  "Every moment with you is a beautiful dream come true",
  "You're the reason I believe in love",
  "Home is wherever I'm with you",
  "The best thing to hold onto in life is each other",
  "I fell in love the way you fall asleep: slowly, then all at once",
  "You are my sun, my moon, and all my stars",
  "I have found the one whom my soul loves",
  "Love is composed of a single soul inhabiting two bodies",
  "You don't find love, it finds you",
  "To love and be loved is to feel the sun from both sides",
  "The greatest thing you'll ever learn is to love and be loved in return",
  "Where there is love there is life",
  "Love recognizes no barriers",
  "Being deeply loved gives you strength, loving deeply gives you courage",
  "A successful relationship requires falling in love many times, with the same person",
  "The best love is the kind that awakens the soul",
  "Love is when the other person's happiness is more important than your own",
  "In all the world, there is no heart for me like yours",
  "You are the finest, loveliest, tenderest person I have ever known",
  "Whatever our souls are made of, yours and mine are the same",
  "I would rather spend one lifetime with you, than face all the ages of this world alone",
  "You have bewitched me, body and soul",
  "I wish I knew how to quit you... just kidding, I never want to"
];

const CuteCard = () => {
  const [quote, setQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    // Change quote every 2 minutes using local quotes
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cute-card">
      <p className="cute-quote">"{quote}"</p>
    </div>
  );
};

export default CuteCard;
