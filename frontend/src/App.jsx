import './App.css'
import HomePage from './components/HomePage/HomePage.jsx';
import PDFReaderPage from './components/PDFReaderPage/PDFReaderPage.jsx';
import {Routes, Route } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
function App() {


  return (
    <div>
      <Toaster position="top-center" />

  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/read/:bookid/:filename/:startPage" element={<PDFReaderPage />} />
  </Routes>
    </div>
  )
}

export default App
