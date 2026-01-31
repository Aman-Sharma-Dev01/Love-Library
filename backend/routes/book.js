const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const bookController = require('../controllers/bookController');

// Upload
router.post('/upload', upload.single('file'), bookController.uploadBook);

// Get all
router.get('/', bookController.getAllBooks);

// Get one
router.get('/:id', bookController.getBookById);

// Delete book
router.delete('/:id', bookController.deleteBook);

// Progress
router.post('/:id/progress', bookController.saveProgress);
router.get('/:id/progress', bookController.getProgress);

// Bookmarks
router.post('/:id/bookmark', bookController.addBookmark);
router.get('/:id/bookmark', bookController.getBookmarks);
router.delete('/:id/bookmark', bookController.deleteBookmark);

// Search
router.get('/search/query', bookController.searchBooks);


module.exports = router;
