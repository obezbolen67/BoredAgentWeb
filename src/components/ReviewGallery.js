import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './ReviewGallery.css';
import Modal from './Modal';
import api from '../services/api';

function ReviewGallery({ results }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: false
  });

  const successResults = useMemo(() => results.filter(r => r.status === 'success'), [results]);

  useEffect(() => {
    if (successResults.length > 0 && selectedIndex < successResults.length) {
      loadImageData(successResults[selectedIndex]);
    }
  }, [selectedIndex, successResults]);

  const loadImageData = async (result) => {
    setIsLoading(true);
    try {
      const detailsResponse = await api.getResult(result.stem);
      setImageData(detailsResponse);
    } catch (error) {
      console.error('Error loading image data:', error);
      setModal({
        isOpen: true,
        title: 'Load Error',
        message: 'Failed to load image data. Please try again.',
        type: 'error',
        showCancel: false,
        onConfirm: null
      });
    } finally {
      setIsLoading(false);
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

  const drawBoundingBoxes = useCallback(() => {
    if (!imageData || !imageData.blocks || !canvasRef.current || !imageRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas.getContext('2d');

    // Wait for image to load
    if (!img.complete) {
      img.onload = () => drawBoundingBoxes();
      return;
    }

    // Get actual displayed image dimensions
    const displayedWidth = img.offsetWidth;
    const displayedHeight = img.offsetHeight;
    
    // Set canvas size to match displayed image
    canvas.width = displayedWidth;
    canvas.height = displayedHeight;
    canvas.style.width = `${displayedWidth}px`;
    canvas.style.height = `${displayedHeight}px`;

    // Calculate scale factors
    const scaleX = displayedWidth / img.naturalWidth;
    const scaleY = displayedHeight / img.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each bounding box
    imageData.blocks.forEach((block, index) => {
      const bbox = block.bbox;
      if (!bbox || bbox.length !== 4) return;

      // Scale bbox coordinates to displayed image size
      const x = bbox[0] * scaleX;
      const y = bbox[1] * scaleY;
      const w = bbox[2] * scaleX;
      const h = bbox[3] * scaleY;

      // Draw rectangle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y - 20, 30, 20);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px Inter';
      ctx.fillText(`${index + 1}`, x + 8, y - 6);
    });
  }, [imageData]);

  useEffect(() => {
    if (imageData) {
      // Redraw when window resizes
      const handleResize = () => drawBoundingBoxes();
      window.addEventListener('resize', handleResize);
      
      // Initial draw
      setTimeout(drawBoundingBoxes, 100);
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [imageData, drawBoundingBoxes]);

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < successResults.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  if (successResults.length === 0) {
    return (
      <div className="review-gallery-container">
        <div className="empty-state">
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3>No results to review</h3>
          <p>Process some images first to see the review gallery</p>
        </div>
      </div>
    );
  }

  const currentResult = successResults[selectedIndex];

  return (
    <div className="review-gallery-container">
      <div className="review-header">
        <h2>Review Gallery</h2>
        <div className="gallery-controls">
          <button 
            className="nav-button" 
            onClick={handlePrevious} 
            disabled={selectedIndex === 0}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <span className="gallery-counter">
            {selectedIndex + 1} / {successResults.length}
          </span>
          <button 
            className="nav-button" 
            onClick={handleNext} 
            disabled={selectedIndex === successResults.length - 1}
          >
            Next
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="review-filename">{currentResult.original_filename}</div>

      <div className="review-content">
        {/* Original Image with Bounding Boxes */}
        <div className="review-panel">
          <h3>Original Image with Detected Regions</h3>
          <div className="image-container">
            {isLoading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                <img
                  ref={imageRef}
                  src={`http://localhost:5000/api/image/${currentResult.original_filename}`}
                  alt="Original"
                  className="review-image"
                  onLoad={drawBoundingBoxes}
                />
                <canvas
                  ref={canvasRef}
                  className="bbox-canvas"
                />
              </>
            )}
          </div>
          {imageData && imageData.blocks && (
            <div className="bbox-info">
              {imageData.blocks.length} text regions detected
            </div>
          )}
        </div>

        {/* PDF Preview */}
        <div className="review-panel">
          <h3>Generated PDF</h3>
          <div className="pdf-container">
            <embed
              src={api.downloadPDF(currentResult.stem)}
              type="application/pdf"
              className="pdf-viewer"
            />
          </div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="thumbnail-gallery">
        <h4>All Results</h4>
        <div className="thumbnail-list">
          {successResults.map((result, index) => (
            <div
              key={index}
              className={`thumbnail-item ${index === selectedIndex ? 'active' : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="thumbnail-number">{index + 1}</div>
              <div className="thumbnail-name">{result.original_filename}</div>
            </div>
          ))}
        </div>
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

export default ReviewGallery;
