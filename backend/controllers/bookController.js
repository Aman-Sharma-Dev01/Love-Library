const { createClient } = require('@supabase/supabase-js');
const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');
const pdf = require("pdf-parse");
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Backend use only
);

exports.uploadBook = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({ error: "Title and file are required" });
    }

    const filePath = path.join(__dirname, "../uploads", file.filename);
    const fileBuffer = fs.readFileSync(filePath);

    const pdfData = await pdf(fileBuffer);
    const totalPages = pdfData.numpages || 1;

    const fileExt = path.extname(file.originalname);
    const uniqueName = `${Date.now()}${fileExt}`;

    // 📤 Upload to Supabase Storage (bucket must be created already)
    const { data, error } = await supabase.storage
      .from("books") // name of your bucket
      .upload(uniqueName, fileBuffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // 🔗 Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("books")
      .getPublicUrl(uniqueName);

    // ✅ Save to MongoDB
    const book = new Book({
      title,
      filename: publicUrlData.publicUrl,
      totalPages,
    });

    await book.save();
    fs.unlinkSync(filePath); // cleanup local file

    res.status(201).json({ message: "Book uploaded to Supabase", book });
  } catch (err) {
    console.error("Supabase Upload Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};


exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ uploadedAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

exports.getBookById = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    // Delete the file
    const filePath = path.join(__dirname, '../uploads/', book.filename);
    fs.unlink(filePath, async err => {
      if (err) console.warn('File delete failed:', err);
      await Book.findByIdAndDelete(req.params.id);
      res.json({ message: 'Book deleted successfully' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete book' });
  }
};

exports.saveProgress = async (req, res) => {
  const { progress } = req.body;
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  book.progress = progress;
  await book.save();
  res.json({ message: 'Progress saved', progress });
};

exports.getProgress = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json({ progress: book.progress });
};

exports.addBookmark = async (req, res) => {
  const { label, page } = req.body;
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  book.bookmarks.push({ label, page });
  await book.save();
  res.json({ message: 'Bookmark added', bookmarks: book.bookmarks });
};

exports.getBookmarks = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book.bookmarks);
};

exports.deleteBookmark = async (req, res) => {
  try {
    const { bookmarkIndex } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    if (bookmarkIndex < 0 || bookmarkIndex >= book.bookmarks.length) {
      return res.status(400).json({ error: 'Invalid bookmark index' });
    }

    book.bookmarks.splice(bookmarkIndex, 1);
    await book.save();
    res.json({ message: 'Bookmark deleted', bookmarks: book.bookmarks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
};

exports.searchBooks = async (req, res) => {
  const q = req.query.q || '';
  const books = await Book.find({
    title: { $regex: q, $options: 'i' }
  });
  res.json(books);
};
