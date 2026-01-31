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
  // streak is loaded asynchronously, so it may be undefined initially
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
  useEffect(() => {
      getStreak();
    }, []);

  // PWA Install prompt listener
  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if prompt was already captured before React mounted
    if (window.deferredInstallPrompt) {
      setDeferredPrompt(window.deferredInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredInstallPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.deferredInstallPrompt = null;
      toast.success('App installed successfully! 📚');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        toast('To install: tap Share button, then "Add to Home Screen"', { icon: '📱', duration: 5000 });
      } else {
        toast('Click the install icon in your browser\'s address bar ⬆️', { icon: '💡', duration: 5000 });
      }
    }
  };

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
        {!isInstalled && (
          <button className="install-btn" onClick={handleInstallClick}>
            📲 Install
          </button>
        )}
      </div>
      
    </div>
  );
};

export default Navbar;
