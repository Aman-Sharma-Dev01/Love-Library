import React, { useState } from "react";
import "./BookCard.css";
import axios from "axios";
import toast from "react-hot-toast";

const BookCard = ({ bookid, title, progress, index, totalPages, bookmarks = [] }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const gradientClasses = [
    "book-color-1", "book-color-2", "book-color-3", "book-color-4",
    "book-color-5", "book-color-6", "book-color-7", "book-color-8"
  ];

  const tiltAngles = ["rotate(-3deg)", "rotate(2deg)", "rotate(-3deg)", "rotate(2deg)", "rotate(0deg)"];
  const bookColorClass = gradientClasses[index % gradientClasses.length];
  const percent = totalPages ? Math.round((progress / totalPages) * 100) : 0;
  const tiltStyle = { transform: `${tiltAngles[index % tiltAngles.length]}` };

  const handleOpen = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/books/${bookid}`);
      const { filename, progress } = res.data;

      if (filename) {
        const startPage = progress || 1;
       const viewerUrl = `/read/${bookid}/${encodeURIComponent(filename)}/${startPage}`;
    window.open(viewerUrl, "_blank");
      } else {
        alert("No file found.");
      }
    } catch (err) {
      console.error("Error opening book:", err);
      alert("Failed to open book.");
    }
  };

  const openDeletePopup = (e) => {
    e.stopPropagation();
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    setShowDeletePopup(true);
    try {
      await axios.delete(`http://localhost:3001/api/books/${bookid}`);
      window.location.reload(); // Ideally: update parent state instead
      toast.success("Book deleted successfully!" );
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete.");
      toast.error("Failed to delete book." );
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  return (
    <div className="book-wrapper" style={tiltStyle}>
      <div onClick={toggleMenu} className={`book-card ${bookColorClass}`}>
        <span className="book-title">{title}</span>

        <div className="shelf-progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%` }}></div>
        </div>

        {showMenu && (
          <div className={`book-menu ${index < 11 ? "bottom-menu" : "top-menu"}`} onClick={(e) => e.stopPropagation()}>
            <h4>{title}</h4>
            <p>Progress: Page {progress} of {totalPages}</p>

            <div className="bookmarks-section">
              <h2>Bookmarks:</h2>
              {bookmarks.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#999" }}>No bookmarks</p>
              ) : (
                <ul>
                  {bookmarks.map((bm, i) => (
                    <li key={i}>🔖 {bm.label} — Page {bm.page}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="book-menu-actions">
              <button onClick={handleOpen}>📖 {progress > 1 ? "Resume" : "Read"} Book</button>
              <button className="delete-btn" onClick={openDeletePopup}>🗑️ Delete</button>
            </div>
          </div>
        )}
      </div>

      {showDeletePopup && (
        <div className="confirm-popup-overlay" onClick={() => setShowDeletePopup(false)}>
          <div className="confirm-popup" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to delete <strong>{title}</strong>?</p>
            <div className="confirm-buttons">
              <button className="confirm-delete" onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => setShowDeletePopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCard;
