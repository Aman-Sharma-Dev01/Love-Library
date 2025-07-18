import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../utils";

const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [books, setBooks] = useState([]);

  const getAllBooks = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/books`);
      setBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch books:", err);
    }
  };

  const deleteBook = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/books/${id}`);
      setBooks(prev => prev.filter(book => book._id !== id));
    } catch (err) {
      console.error("Failed to delete book:", err);
    }
  };

  const searchBooks = async (query) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/books/search/query?q=${query}`);
      setBooks(res.data); // this line updates the shelf directly
    } catch (err) {
      console.error("Search failed:", err);
      setBooks([]); // clear shelf on failure
    }
  };

  const addBookmark = async (bookId, bookmark) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/books/${bookId}/bookmark`, bookmark);
      return res.data;
    } catch (err) {
      console.error("Bookmark failed:", err);
    }
  };

  const updateProgress = async (bookId, progress) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/books/${bookId}/progress`, { progress });
      return res.data;
    } catch (err) {
      console.error("Progress update failed:", err);
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        setBooks,
        getAllBooks,
        deleteBook,
        searchBooks,
        addBookmark,
        updateProgress,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => useContext(LibraryContext);
