import { useParams } from "react-router-dom";
import CustomPDFViewer from "../CustomPDFViewer/CustomPDFViewer.jsx";

const PDFReaderPage = () => {
  const { bookid, filename, startPage } = useParams();
  const pdfurl = decodeURIComponent(filename)

  return (
    <CustomPDFViewer
      fileUrl={pdfurl}
      startPage={parseInt(startPage, 10) || 1}
      bookid={bookid}
    />
  );
};

export default PDFReaderPage;
