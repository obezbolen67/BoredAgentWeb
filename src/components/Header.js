import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h1>Image to PDF Converter</h1>
            <p>Advanced OCR-powered document processing</p>
          </div>
        </div>
        
        <div className="header-status">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>System Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
