import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './UploadBook.css';
import { BACKEND_URL } from '../../utils';

const UploadBook = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !file) {
      toast.error("Please provide a title and a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await axios.post(`${BACKEND_URL}/api/books/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('"Safely added to your shelf, my love 💖📚"',{
  duration: 5000, // 5000 ms = 5 seconds
});
      setTitle('');
      setFile(null);
    } catch (err) {
      toast.error('Upload failed!');
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-book-container">
      <h2>Upload a New Book</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title"
            required
          />
        </div>

        <div className="form-group">
          <label>PDF File:</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Book'}
        </button>
      </form>
    </div>
  );
};

export default UploadBook;
