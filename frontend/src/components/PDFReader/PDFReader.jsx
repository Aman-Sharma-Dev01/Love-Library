import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "./PDFReader.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js"; // Adjust path if needed

const PDFReader = ({ fileUrl, bookid, startPage = 1 }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(startPage);
  const intervalRef = useRef(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.electronAPI?.saveProgress?.(bookid, pageNumber);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [bookid, pageNumber]);

  // Poll page number and save every 5s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (bookid) {
        window.electronAPI?.saveProgress?.(bookid, pageNumber);
      }
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [bookid, pageNumber]);

  return (
    <div className="pdf-container">
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>

      <div className="pdf-controls">
        <button onClick={() => setPageNumber(p => Math.max(p - 1, 1))}>⬅ Prev</button>
        <span>{pageNumber} / {numPages}</span>
        <button onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}>Next ➡</button>
      </div>
    </div>
  );
};

export default PDFReader;
