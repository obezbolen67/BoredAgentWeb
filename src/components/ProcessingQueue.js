import React from 'react';
import './ProcessingQueue.css';

function ProcessingQueue({ queue, isProcessing }) {
  if (queue.length === 0) {
    return (
      <div className="processing-queue-container">
        <div className="empty-state">
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No files in queue</h3>
          <p>Upload files to start processing</p>
        </div>
      </div>
    );
  }

  const totalFiles = queue.length;
  const completedFiles = queue.filter(item => item.status === 'success' || item.status === 'failed').length;
  const successFiles = queue.filter(item => item.status === 'success').length;
  const failedFiles = queue.filter(item => item.status === 'failed').length;

  return (
    <div className="processing-queue-container">
      <div className="queue-header">
        <div>
          <h2>Processing Queue</h2>
          <p>{completedFiles} of {totalFiles} files completed</p>
        </div>
        
        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <span>Processing...</span>
          </div>
        )}
      </div>

      <div className="queue-stats">
        <div className="stat-item">
          <span className="stat-label">Total</span>
          <span className="stat-value">{totalFiles}</span>
        </div>
        <div className="stat-item success">
          <span className="stat-label">Success</span>
          <span className="stat-value">{successFiles}</span>
        </div>
        <div className="stat-item failed">
          <span className="stat-label">Failed</span>
          <span className="stat-value">{failedFiles}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{totalFiles - completedFiles}</span>
        </div>
      </div>

      <div className="queue-list">
        {queue.map((item) => (
          <div key={item.id} className={`queue-item ${item.status}`}>
            <div className="item-icon">
              {item.status === 'pending' && (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {item.status === 'processing' && (
                <div className="spinner small"></div>
              )}
              {item.status === 'success' && (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {item.status === 'failed' && (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            <div className="item-details">
              <div className="item-name">{item.name}</div>
              <div className="item-status-text">
                {item.status === 'pending' && 'Waiting...'}
                {item.status === 'processing' && 'Processing...'}
                {item.status === 'success' && 'Completed successfully'}
                {item.status === 'failed' && (item.error || 'Processing failed')}
              </div>
            </div>

            {item.status === 'processing' && (
              <div className="item-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{item.progress}%</span>
              </div>
            )}

            {item.result && item.result.processing_time && (
              <div className="item-time">
                {item.result.processing_time.toFixed(2)}s
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProcessingQueue;
