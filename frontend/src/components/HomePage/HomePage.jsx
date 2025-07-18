import React from 'react'
import './HomePage.css';
import LibraryShelf from '../LibraryShelf/BookShelf.jsx';
import Navbar from '../Navbar/Navbar.jsx';


const HomePage = () => {
  return (
    <div>
        <Navbar/>
        <LibraryShelf/>
    </div>
  )
}

export default HomePage