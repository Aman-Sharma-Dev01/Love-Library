import React, { useState , useEffect } from "react";
import './Navbar.css';
// import logo from '../../assets/icom.png';
import { toast } from "react-hot-toast";
import axios from "axios";
import { useLibrary } from "../../Context/LibraryContext";
import { BACKEND_URL } from "../../utils";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const { setBooks, getAllBooks , streak , getStreak } = useLibrary();
  useEffect(() => {
      getStreak();
    }, []);

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (query.trim() === "") {
        getAllBooks(); // Reset to all books if query is empty
        return;
      }
      try {
        const res = await axios.get(`${BACKEND_URL}/api/books/search/query?q=${query}`);
        if (res.data?.length === 0) {
          toast.error("Book not found!");
          getAllBooks();
        } else {
          setBooks(res.data); // Replace shelf with search results
        }
      } catch (err) {
        console.error("Search failed", err);
        toast.error("Something went wrong");
      }
    }
  };
  return (
    <div className="navbar-container">
      <div className="head-line"><h2>Welcome back, Sunshine...❤</h2></div>
      <div className="Navbar">
        <div className="logo">
          <img src={'/Icom.png'} alt="Love Library Logo" />
          <h2>Love Library</h2>
          <p className="streak-badge">
  {streak.missedYesterday ? "🕒" : "⚡"} {streak.streak}
</p>

        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for books, authors, or genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
      
    </div>
  );
};

export default Navbar;
