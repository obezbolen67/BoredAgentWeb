import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';

function FileUpload({ onFilesUpload, isProcessing, batchSize, onChangeBatchSize }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFilesUpload(acceptedFiles, batchSize);
    }
  }, [onFilesUpload, batchSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif'],
      'application/zip': ['.zip']
    },
    disabled: isProcessing,
    multiple: true
  });

  return (
    <div className="file-upload-container">
      <div className="upload-header">
        <div>
          <h2>Upload Files</h2>
          <p>Upload images or ZIP archives containing images for OCR processing</p>
        </div>
        <div className="batch-control">
          <label htmlFor="batch-size">Concurrent Processing:</label>
          <input 
            type="number" 
            id="batch-size"
            min="1" 
            max="10" 
            value={batchSize}
            onChange={(e) => onChangeBatchSize(parseInt(e.target.value) || 1)}
            disabled={isProcessing}
          />
          <span className="batch-label">{batchSize} files at once</span>
        </div>
      </div>

      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="dropzone-content">
          <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          {isProcessing ? (
            <>
              <h3>Processing...</h3>
              <p>Please wait while we process your files</p>
            </>
          ) : isDragActive ? (
            <>
              <h3>Drop files here</h3>
              <p>Release to upload your files</p>
            </>
          ) : (
            <>
              <h3>Drag & drop files here</h3>
              <p>or click to browse your computer</p>
              <div className="file-types">
                <span className="file-type-badge">PNG</span>
                <span className="file-type-badge">JPG</span>
                <span className="file-type-badge">TIFF</span>
                <span className="file-type-badge">BMP</span>
                <span className="file-type-badge">ZIP</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="upload-info">
        <div className="info-card">
          <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4>Supported Formats</h4>
            <p>Images: PNG, JPG, JPEG, BMP, TIFF<br />Archives: ZIP (containing images)</p>
          </div>
        </div>

        <div className="info-card">
          <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4>What We Do</h4>
            <p>Extract text from images using advanced OCR<br />Generate formatted PDFs with proper styling</p>
          </div>
        </div>

        <div className="info-card">
          <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div>
            <h4>Batch Processing</h4>
            <p>Upload multiple files at once<br />Concurrent processing for faster results</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
