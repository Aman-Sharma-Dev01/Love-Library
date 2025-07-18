import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import WordTooltip from "../WordTooltip/WordTooltip";
import "./CustomPDFViewer.css";
import { BACKEND_URL } from "../../utils";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const CustomPDFViewer = ({ fileUrl, startPage = 1, bookid }) => {
  const [numPages, setNumPages] = useState(null);
  const [visiblePage, setVisiblePage] = useState(startPage);
  const [renderedPages, setRenderedPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef();
  const pageHeightRef = useRef(0);
  const lastSavedPage = useRef(startPage);

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setRenderedPages(0);
    setTimeout(() => {
      const firstPage = containerRef.current?.querySelector(".react-pdf__Page");
      if (firstPage) {
        pageHeightRef.current = firstPage.clientHeight + 16;
        const target = containerRef.current?.querySelector(`[data-page-number="${startPage}"]`);
        if (target) {
          target.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }
    }, 500);
  };

  const updateVisiblePage = () => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    const pageHeight = pageHeightRef.current || 800;
    const current = Math.min(Math.round(scrollTop / pageHeight) + 1, numPages);
    setVisiblePage(current);
  };

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

    container.addEventListener("scroll", updateVisiblePage);
    const interval = setInterval(updateVisiblePage, 1000);
    return () => {
      container.removeEventListener("scroll", updateVisiblePage);
      clearInterval(interval);
    };
  }, [numPages]);

  useEffect(() => {
    if (numPages && renderedPages === numPages) {
      setTimeout(() => setLoading(false), 300);
    }
  }, [renderedPages, numPages]);

 useEffect(() => {
  const handleMouseUp = (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.includes(" ")) {
      setSelectedWord(null);
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // ✅ Adjust for the scroll inside .pdf-scroll-container
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

  return (
    <div className="pdf-scroll-container" ref={containerRef}>
      {loading && (
        <div className="pdf-loading-overlay">
          <div className="pdf-spinner" />
          <p>Your Book Is Loading Sunshine, Please wait... ❤</p>
        </div>
      )}

      <Document file={fileUrl} onLoadSuccess={handleDocumentLoadSuccess}>
        {Array.from({ length: numPages || 0 }, (_, i) => (
          <div key={i} className="page-wrapper">
            <Page
              pageNumber={i + 1}
              data-page-number={i + 1}
              width={Math.min(window.innerWidth * 0.100, 1000)}
              renderMode="canvas"
              renderAnnotationLayer={true}
              renderTextLayer={true}
              onRenderSuccess={() => setRenderedPages((prev) => prev + 1)}
            />
            <div className="page-number-label">
              {i + 1} / {numPages}
            </div>
          </div>
        ))}
      </Document>
      {selectedWord && (
  <WordTooltip word={selectedWord} position={tooltipPos} onClose={() => setSelectedWord(null)} />
)}
    </div>

  );
};

export default CustomPDFViewer;
