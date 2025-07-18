const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  totalPages: { type: Number },
  progress: {
    type: Number, // page number or percent
    default: 0
  },
  bookmarks: [
    {
      label: String,
      page: Number,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Book', bookSchema);
