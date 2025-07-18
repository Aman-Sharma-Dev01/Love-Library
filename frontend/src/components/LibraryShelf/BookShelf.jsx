import React, { useEffect } from "react";
import BookCard from "../BooksLayout/BookCarsd.jsx";
import "./BookShelf.css";
import { useLibrary } from "../../Context/LibraryContext.jsx";
import UploadBook from "../UploadBook/UploadBook.jsx";
import CuteCard from "../CuteCard/CuteCard.jsx";
import Spiral from "../Spiral/Spiral.jsx";
import SpiralDots from "../Spiral/SpiralDots.jsx";

const booksPerShelf = 11;

const BookShelf = () => {
  const { books, getAllBooks } = useLibrary();
  console.log("Books in BookShelf:", books , getAllBooks);
  
  useEffect(() => {
    getAllBooks();
  }, []);

  const rows = Math.ceil(books.length / booksPerShelf);
  
  return (
    <div className="bookshelf-container">
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
                    bookid={book._id}
                    title={book.title}
                    progress={book.progress}
                    index={index + rowIndex * booksPerShelf}
                    totalPages={book.totalPages}
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
