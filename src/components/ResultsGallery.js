import React, { useState } from 'react';
import './ResultsGallery.css';
import Modal from './Modal';
import api from '../services/api';

function ResultsGallery({ results, onRefresh }) {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: false
  });
  if (results.length === 0) {
    return (
      <div className="results-gallery-container">
        <div className="empty-state">
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3>No results yet</h3>
          <p>Upload and process some images to see results here</p>
        </div>
      </div>
    );
  }

  const successResults = results.filter(r => r.status === 'success');

  const handleDownload = async (stem, filename) => {
    try {
      const url = api.downloadPDF(stem);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setModal({
        isOpen: true,
        title: 'Download Error',
        message: 'Failed to download PDF. Please try again.',
        type: 'error',
        showCancel: false,
        onConfirm: null
      });
    }
  };

  const handleDownloadAll = async () => {
    try {
      const response = await fetch(api.getDownloadAllUrl(), {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download files');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_pdfs_${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading all PDFs:', error);
      setModal({
        isOpen: true,
        title: 'Download Error',
        message: 'Failed to download all PDFs. Please try again.',
        type: 'error',
        showCancel: false,
        onConfirm: null
      });
    }
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      title: '',
      message: '',
      type: 'info',
      onConfirm: null,
      showCancel: false
    });
  };

  return (
    <div className="results-gallery-container">
      <div className="results-header">
        <div>
          <h2>Results Gallery</h2>
          <p>{successResults.length} processed documents available</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={onRefresh}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          {successResults.length > 0 && (
            <button className="download-all-btn" onClick={handleDownloadAll}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All as ZIP
            </button>
          )}
        </div>
      </div>

      <div className="results-grid">
        {successResults.map((result, index) => (
          <div key={index} className="result-card">
            <div className="card-header">
              <div className="file-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="card-title">
                <div className="filename" title={result.original_filename}>
                  {result.original_filename}
                </div>
                <div className="timestamp">
                  {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="card-stats">
              <div className="stat">
                <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="stat-value">{result.blocks_count || 'N/A'}</div>
                  <div className="stat-label">Blocks</div>
                </div>
              </div>

              <div className="stat">
                <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="stat-value">{result.text_length || 'N/A'}</div>
                  <div className="stat-label">Characters</div>
                </div>
              </div>

              <div className="stat">
                <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="stat-value">{result.processing_time?.toFixed(2)}s</div>
                  <div className="stat-label">Time</div>
                </div>
              </div>
            </div>

            <button 
              className="download-btn"
              onClick={() => handleDownload(result.stem, result.stem)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        ))}
      </div>

      {/* Custom Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        showCancel={modal.showCancel}
      />
    </div>
  );
}

export default ResultsGallery;
