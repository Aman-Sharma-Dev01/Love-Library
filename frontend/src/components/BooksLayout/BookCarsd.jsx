import React, { useState } from "react";
import "./BookCard.css";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../../utils";

const BookCard = ({ bookid, title, progress, index, totalPages, hasBookmarks, isMenuOpen, onToggleMenu }) => {
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
      const res = await axios.get(`${BACKEND_URL}/api/books/${bookid}`);
      const resp = await axios.post(`${BACKEND_URL}/api/streak/update`)
      console.log(resp.data.message);
      
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
      await axios.delete(`${BACKEND_URL}/api/books/${bookid}`);
      window.location.reload();
      toast.success("Book deleted successfully!" );
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete.");
      toast.error("Failed to delete book." );
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    onToggleMenu(bookid);
  };

  return (
    <div className={`book-wrapper ${isMenuOpen ? 'menu-open' : ''}`} style={tiltStyle}>
      <div onClick={toggleMenu} className={`book-card ${bookColorClass}`}>
        {hasBookmarks && <span className="bookmark-indicator">🔖</span>}
        <span className="book-title">{title}</span>

        <div className="shelf-progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%` }}></div>
        </div>

        {isMenuOpen && (
          <div className={`book-menu ${index < 11 ? "bottom-menu" : "top-menu"}`} onClick={(e) => e.stopPropagation()}>
            <h4>{title}</h4>
            <p>Progress: Page {progress} of {totalPages}</p>

            <div className="book-menu-actions">
              <button onClick={() => handleOpen()}>📖 {progress > 1 ? "Resume" : "Read"} Book</button>
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
