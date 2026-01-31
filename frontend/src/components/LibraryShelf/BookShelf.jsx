import React, { useEffect, useState, useRef } from "react";
import BookCard from "../BooksLayout/BookCarsd.jsx";
import "./BookShelf.css";
import { useLibrary } from "../../Context/LibraryContext.jsx";
import UploadBook from "../UploadBook/UploadBook.jsx";
import CuteCard from "../CuteCard/CuteCard.jsx";
import Spiral from "../Spiral/Spiral.jsx";
import SpiralDots from "../Spiral/SpiralDots.jsx";

const booksPerShelf = 10;

const BookShelf = () => {
  const { books, getAllBooks } = useLibrary();
  const [openMenuId, setOpenMenuId] = useState(null);
  const shelfRef = useRef(null);
  
  useEffect(() => {
    getAllBooks();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shelfRef.current && !e.target.closest('.book-menu') && !e.target.closest('.book-card')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const rows = Math.ceil(books.length / booksPerShelf);
  
  return (
    <div className="bookshelf-container" ref={shelfRef}>
      <UploadBook/>
      <SpiralDots/>
      <Spiral/>
      <CuteCard/>
      <div className="almirah">
        {[...Array(rows)].map((_, rowIndex) => (
          <div className="shelf-row" key={rowIndex}>
            <div className="shelf">
              {books
                .slice(rowIndex * booksPerShelf, (rowIndex + 1) * booksPerShelf)
                .map((book, index) => (
                  <BookCard
                    key={book._id}
                    bookid={book._id}
                    title={book.title}
                    progress={book.progress}
                    index={index + rowIndex * booksPerShelf}
                    totalPages={book.totalPages}
                    hasBookmarks={book.bookmarks && book.bookmarks.length > 0}
                    isMenuOpen={openMenuId === book._id}
                    onToggleMenu={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
      </div>
  );
};

export default BookShelf;
