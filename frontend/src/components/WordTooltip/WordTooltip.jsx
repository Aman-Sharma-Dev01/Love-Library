import React, { useEffect, useState } from "react";
import "./WordTooltip.css";

const WordTooltip = ({ word, position, onClose }) => {
  const [definition, setDefinition] = useState("Loading...");

  useEffect(() => {
    if (!word) return;

    const fetchDefinition = async () => {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();

    if (res.status === 404 || !Array.isArray(data)) {
      setDefinition("No definition found for this word.");
      return;
    }

    const def = data[0]?.meanings?.[0]?.definitions?.[0]?.definition;
    setDefinition(def || "Definition not available.");
  } catch (err) {
    setDefinition("Error fetching definition.");
    console.error(err);
  }
};

    fetchDefinition();
  }, [word]);

  return (
    <div className="tooltip-box" style={{ top: position.y, left: position.x }}>
      <strong>{word}</strong>
      <p>{definition}</p>
      <button onClick={onClose}>×</button>
    </div>
  );
};

export default WordTooltip;
