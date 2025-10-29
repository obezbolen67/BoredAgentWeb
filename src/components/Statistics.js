import React from 'react';
import './Statistics.css';

function Statistics({ statistics, results }) {
  const failedResults = results.filter(r => r.status === 'failed');

  return (
    <div className="statistics-container">
      <div className="stats-header">
        <h2>Statistics & Metrics</h2>
        <p>Overview of all processing activities</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statistics.total}</div>
            <div className="stat-label">Total Processed</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statistics.success}</div>
            <div className="stat-label">Successful</div>
          </div>
        </div>

        <div className="stat-card failed">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statistics.failed}</div>
            <div className="stat-label">Failed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statistics.avg_time.toFixed(2)}s</div>
            <div className="stat-label">Avg Time</div>
          </div>
        </div>
      </div>

      {/* Failed Results Section */}
      {failedResults.length > 0 && (
        <div className="failed-section">
          <h3>Failed Conversions</h3>
          <div className="failed-list">
            {failedResults.map((result, index) => (
              <div key={index} className="failed-item">
                <div className="failed-header">
                  <div className="failed-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="failed-details">
                    <div className="failed-filename">{result.original_filename}</div>
                    <div className="failed-time">{new Date(result.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="failed-error">{result.error}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Rate Chart */}
      {statistics.total > 0 && (
        <div className="chart-section">
          <h3>Success Rate</h3>
          <div className="chart-container">
            <div className="chart-bar">
              <div 
                className="chart-fill success" 
                style={{ width: `${(statistics.success / statistics.total) * 100}%` }}
              >
                <span className="chart-label">
                  {statistics.success} ({((statistics.success / statistics.total) * 100).toFixed(1)}%)
                </span>
              </div>
              {statistics.failed > 0 && (
                <div 
                  className="chart-fill failed" 
                  style={{ width: `${(statistics.failed / statistics.total) * 100}%` }}
                >
                  <span className="chart-label">
                    {statistics.failed} ({((statistics.failed / statistics.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Statistics;
