import React from 'react';
import './PDFViewer.css';

function PDFViewer({ isOpen, onClose, pdfUrl, title }) {
  if (!isOpen) return null;

  return (
    <div className="pdf-viewer-overlay" onClick={onClose}>
      <div className="pdf-viewer-container" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-viewer-header">
          <h2 className="pdf-viewer-title">{title || 'PDF Preview'}</h2>
          <button className="pdf-viewer-close" onClick={onClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="pdf-viewer-content">
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            className="pdf-viewer-frame"
          />
        </div>
        <div className="pdf-viewer-footer">
          <a 
            href={pdfUrl} 
            download 
            className="pdf-viewer-download"
            onClick={(e) => e.stopPropagation()}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}

export default PDFViewer;
