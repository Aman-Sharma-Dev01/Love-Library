import React, { useEffect, useState } from "react";
import "./CuteCard.css";

const CuteCard = () => {
  const [quote, setQuote] = useState("Loading something sweet...");

  const fetchQuote = async () => {
    try {
      const res = await fetch(
        "https://api.realinspire.live/v1/quotes/random?limit=1&maxLength=150"
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuote(data[0].content);
      } else {
        throw new Error("No quote returned");
      }
    } catch (err) {
      setQuote("You're my favorite notification 💌");
      console.error("Failed to fetch quote:", err);
    }
  };

  useEffect(() => {
    fetchQuote();
    const interval = setInterval(fetchQuote, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cute-card">
      <p className="cute-quote">“{quote}”</p>
    </div>
  );
};

export default CuteCard;
