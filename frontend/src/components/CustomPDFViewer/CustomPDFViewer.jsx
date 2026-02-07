import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import toast from "react-hot-toast";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import WordTooltip from "../WordTooltip/WordTooltip";
import "./CustomPDFViewer.css";
import { BACKEND_URL } from "../../utils";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Number of pages to render above and below the visible area
const BUFFER_PAGES = 2;

const CustomPDFViewer = ({ fileUrl, startPage = 1, bookid }) => {
  const [numPages, setNumPages] = useState(null);
  const [visiblePage, setVisiblePage] = useState(startPage);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [pageHeight, setPageHeight] = useState(0);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarkPanel, setShowBookmarkPanel] = useState(false);
  const [bookmarkLabel, setBookmarkLabel] = useState("");
  const [pageWidth, setPageWidth] = useState(Math.min(window.innerWidth * 0.99, 1300));

  const containerRef = useRef();
  const lastSavedPage = useRef(startPage);

  // Handle responsive page width on window resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = Math.min(window.innerWidth * 0.99, 1300);
      setPageWidth(newWidth);
      // Update page height based on new width
      const estimatedHeight = newWidth * 1.414 + 16;
      setPageHeight(estimatedHeight);
    };
    
    window.addEventListener('resize', handleResize);
    // Also handle orientation change for mobile
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Calculate which pages should be rendered (virtualization)
  const visiblePages = useMemo(() => {
    if (!numPages) return [];
    const start = Math.max(1, visiblePage - BUFFER_PAGES);
    const end = Math.min(numPages, visiblePage + BUFFER_PAGES);
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [visiblePage, numPages]);

  const handleDocumentLoadSuccess = useCallback(({ numPages: totalPages }) => {
    setNumPages(totalPages);
    // Estimate page height based on A4 ratio (1.414) and width
    const estimatedHeight = pageWidth * 1.414 + 16; // +16 for margin
    setPageHeight(estimatedHeight);
    setLoading(false);
  }, [pageWidth]);

  // Fetch bookmarks on load
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!bookid) return;
      try {
        const res = await axios.get(`${BACKEND_URL}/api/books/${bookid}/bookmark`);
        setBookmarks(res.data || []);
      } catch (err) {
        console.error("Failed to fetch bookmarks:", err);
      }
    };
    fetchBookmarks();
  }, [bookid]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const addBookmark = async () => {
    if (!bookmarkLabel.trim()) {
      toast.error("Please enter a bookmark name");
      return;
    }
    try {
      const res = await axios.post(`${BACKEND_URL}/api/books/${bookid}/bookmark`, {
        label: bookmarkLabel,
        page: visiblePage
      });
      setBookmarks(res.data.bookmarks || []);
      setBookmarkLabel("");
      setShowBookmarkPanel(false);
      toast.success(`Bookmarked page ${visiblePage} 🔖`);
    } catch (err) {
      console.error("Bookmark failed:", err);
      toast.error("Failed to add bookmark");
    }
  };

  const jumpToBookmark = (page) => {
    if (containerRef.current && pageHeight) {
      containerRef.current.scrollTop = (page - 1) * pageHeight;
      setShowBookmarkPanel(false);
    }
  };

  const deleteBookmark = async (e, bookmarkIndex) => {
    e.stopPropagation();
    try {
      const res = await axios.delete(`${BACKEND_URL}/api/books/${bookid}/bookmark`, {
        data: { bookmarkIndex }
      });
      setBookmarks(res.data.bookmarks || []);
      toast.success("Bookmark deleted");
    } catch (err) {
      console.error("Delete bookmark failed:", err);
      toast.error("Failed to delete bookmark");
    }
  };

  // Scroll to start page after document loads
  useEffect(() => {
    if (numPages && pageHeight && !initialScrollDone && containerRef.current) {
      const scrollPosition = (startPage - 1) * pageHeight;
      containerRef.current.scrollTop = scrollPosition;
      setInitialScrollDone(true);
    }
  }, [numPages, pageHeight, startPage, initialScrollDone]);

  const updateVisiblePage = useCallback(() => {
    if (!containerRef.current || !pageHeight) return;
    const scrollTop = containerRef.current.scrollTop;
    const current = Math.min(Math.floor(scrollTop / pageHeight) + 1, numPages || 1);
    setVisiblePage(current);
  }, [pageHeight, numPages]);

  const saveProgress = async (pageToSave = visiblePage) => {
    if (!bookid || !pageToSave || pageToSave === lastSavedPage.current) return;
    try {
      await axios.post(`${BACKEND_URL}/api/books/${bookid}/progress`, {
        progress: pageToSave,
      });
      lastSavedPage.current = pageToSave;
      console.log("✅ Saved progress:", pageToSave);
    } catch (err) {
      console.error("❌ Failed to save progress", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress(visiblePage);
    }, 3000);
    return () => clearInterval(interval);
  }, [visiblePage, bookid]);

  useEffect(() => {
    const handleUnload = () => saveProgress(visiblePage);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") saveProgress(visiblePage);
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [visiblePage, bookid]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use throttled scroll handler for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateVisiblePage();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [updateVisiblePage]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (!selectedText || selectedText.includes(" ")) {
        setSelectedWord(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Adjust for the scroll inside .pdf-scroll-container
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();

        const x = rect.left - containerRect.left + container.scrollLeft + 10;
        const y = rect.top - containerRect.top + container.scrollTop + 10;

        setSelectedWord(selectedText);
        setTooltipPos({ x, y });
      } catch (err) {
        setSelectedWord(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Calculate total height for the scroll container
  const totalHeight = numPages ? numPages * pageHeight : 0;

  // Handle page number input for quick navigation
  const handlePageJump = useCallback((e) => {
    if (e.key === "Enter") {
      const targetPage = parseInt(e.target.value, 10);
      if (targetPage >= 1 && targetPage <= numPages && containerRef.current) {
        containerRef.current.scrollTop = (targetPage - 1) * pageHeight;
      }
    }
  }, [numPages, pageHeight]);

  return (
    <div className="pdf-scroll-container" ref={containerRef}>
      {loading && (
        <div className="pdf-loading-overlay">
          <div className="pdf-spinner" />
          <p>Your Book Is Loading Sunshine, Please wait... ❤</p>
        </div>
      )}

      {/* Page indicator with jump feature */}
      {numPages && (
        <div className="pdf-toolbar">
          <div className="pdf-page-indicator">
            <input
              type="number"
              min="1"
              max={numPages}
              value={visiblePage}
              onChange={(e) => setVisiblePage(parseInt(e.target.value, 10) || 1)}
              onKeyDown={handlePageJump}
              className="page-jump-input"
            />
            <span> / {numPages}</span>
          </div>
          
          <div className="pdf-toolbar-buttons">
            <button 
              className="toolbar-btn" 
              onClick={() => setShowBookmarkPanel(!showBookmarkPanel)}
              title="Bookmarks"
            >
              🔖
            </button>
            <button 
              className="toolbar-btn" 
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? "⛶" : "⛶"}
            </button>
          </div>
        </div>
      )}

      {/* Bookmark Panel */}
      {showBookmarkPanel && (
        <div className="bookmark-panel">
          <div className="bookmark-panel-header">
            <h3>🔖 Bookmarks</h3>
            <button className="close-panel-btn" onClick={() => setShowBookmarkPanel(false)}>×</button>
          </div>
          
          <div className="add-bookmark-section">
            <input
              type="text"
              placeholder="Bookmark name..."
              value={bookmarkLabel}
              onChange={(e) => setBookmarkLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBookmark()}
              className="bookmark-input"
            />
            <button className="add-bookmark-btn" onClick={addBookmark}>
              + Add Page {visiblePage}
            </button>
          </div>

          <div className="bookmarks-list">
            {bookmarks.length === 0 ? (
              <p className="no-bookmarks">No bookmarks yet. Add one above!</p>
            ) : (
              bookmarks.map((bm, i) => (
                <div 
                  key={i} 
                  className="bookmark-item"
                >
                  <div className="bookmark-item-info" onClick={() => jumpToBookmark(bm.page)}>
                    <span className="bookmark-label">🔖 {bm.label}</span>
                    <span className="bookmark-page">Page {bm.page}</span>
                  </div>
                  <button 
                    className="bookmark-delete-btn-panel"
                    onClick={(e) => deleteBookmark(e, i)}
                    title="Delete bookmark"
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <Document file={fileUrl} onLoadSuccess={handleDocumentLoadSuccess} loading={null}>
        {/* Virtual scroll container - maintains total scroll height */}
        <div style={{ height: totalHeight, position: "relative" }}>
          {/* Only render visible pages + buffer */}
          {visiblePages.map((pageNum) => (
            <div
              key={pageNum}
              className="page-wrapper"
              style={{
                position: "absolute",
                top: (pageNum - 1) * pageHeight,
                left: 0,
                right: 0,
                height: pageHeight,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Page
                pageNumber={pageNum}
                data-page-number={pageNum}
                width={pageWidth}
                renderMode="canvas"
                renderAnnotationLayer={true}
                renderTextLayer={true}
                loading={
                  <div className="page-placeholder" style={{ width: pageWidth, height: pageHeight - 16 }}>
                    <div className="page-placeholder-spinner" />
                  </div>
                }
              />
              <div className="page-number-label">
                {pageNum} / {numPages}
              </div>
            </div>
          ))}
        </div>
      </Document>

      {selectedWord && (
        <WordTooltip word={selectedWord} position={tooltipPos} onClose={() => setSelectedWord(null)} />
      )}
    </div>
  );
};

export default CustomPDFViewer;
