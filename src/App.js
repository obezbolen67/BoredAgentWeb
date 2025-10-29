import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ProcessingQueue from './components/ProcessingQueue';
import Statistics from './components/Statistics';
import ResultsGallery from './components/ResultsGallery';
import ReviewGallery from './components/ReviewGallery';
import Header from './components/Header';
import Modal from './components/Modal';
import api from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    success: 0,
    failed: 0,
    total_time: 0,
    avg_time: 0
  });
  const [processingQueue, setProcessingQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchSize, setBatchSize] = useState(5);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: false
  });

  const STATE_KEY = 'ba_ui_state_v1';

  // Load results and statistics
  const loadData = async () => {
    try {
      const [resultsData, statsData] = await Promise.all([
        api.getResults(),
        api.getStatistics()
      ]);
      
      setResults(resultsData.results || []);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Load data on mount and restore UI state
  useEffect(() => {
    loadData();
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.activeTab) setActiveTab(state.activeTab);
        if (Array.isArray(state.processingQueue)) setProcessingQueue(state.processingQueue);
        if (typeof state.isProcessing === 'boolean') setIsProcessing(state.isProcessing);
        if (typeof state.batchSize === 'number') setBatchSize(state.batchSize);
      }
    } catch (_) {
      // ignore corrupted state
    }
  }, []);

  // Persist UI state
  useEffect(() => {
    const payload = { activeTab, processingQueue, isProcessing, batchSize };
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(payload));
    } catch (_) {
      // storage may be unavailable; fail silently
    }
  }, [activeTab, processingQueue, isProcessing, batchSize]);

  // When processing is ongoing (including restored after refresh), poll backend and update queue
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(async () => {
      try {
        const resultsData = await api.getResults();
        const latest = resultsData.results || [];
        setProcessingQueue(current => {
          if (!current || current.length === 0) return current;
          const updated = current.map(item => {
            const match = latest.find(r => r.original_filename === item.name);
            if (match) {
              return {
                ...item,
                status: match.status || item.status,
                progress: match.status ? 100 : item.progress,
                result: match
              };
            }
            return item;
          });
          const allDone = updated.every(it => it.status === 'success' || it.status === 'failed' || it.status === 'skipped');
          if (allDone && updated.length > 0) {
            setIsProcessing(false);
            setActiveTab('results');
          }
          return updated;
        });
      } catch (_) {
        // ignore transient errors
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  // When processing finishes, reload data once to get fresh results
  useEffect(() => {
    if (!isProcessing) {
      loadData();
    }
  }, [isProcessing]);

  // Pull fresh data when user switches to Results or Review
  useEffect(() => {
    if (activeTab === 'results' || activeTab === 'review' || activeTab === 'statistics') {
      loadData();
    }
  }, [activeTab]);

  // Handle file upload
  const handleFilesUpload = async (files, uiBatchSize) => {
    setIsProcessing(true);
    if (uiBatchSize && uiBatchSize !== batchSize) setBatchSize(uiBatchSize);
    const effectiveBatch = uiBatchSize || batchSize;
    
    // Add files to processing queue
    const queueItems = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      status: 'pending',
      progress: 0
    }));
    
    setProcessingQueue(queueItems);
    setActiveTab('processing');

    try {
      // Create FormData
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      // include batch size for backend
      formData.append('batch_size', String(effectiveBatch));

      // Update queue to processing
      setProcessingQueue(prev => 
        prev.map(item => ({ ...item, status: 'processing', progress: 50 }))
      );

      // Upload and process
      const response = await api.uploadFiles(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProcessingQueue(prev => 
          prev.map(item => ({ ...item, progress: percentCompleted }))
        );
      });

      // Update queue with results
      if (response.results) {
        const updatedQueue = queueItems.map((item, index) => {
          const result = response.results.find(r => 
            r.original_filename === item.name
          ) || response.results[index];

          return {
            ...item,
            status: result?.status || 'failed',
            progress: 100,
            result: result
          };
        });

        setProcessingQueue(updatedQueue);
      }

      // Reload data
      await loadData();

      // Auto-switch to results after 2 seconds
      setTimeout(() => {
        setActiveTab('results');
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      
      // Mark all as failed
      setProcessingQueue(prev => 
        prev.map(item => ({
          ...item,
          status: 'failed',
          error: error.message
        }))
      );

      // Show error modal
      setModal({
        isOpen: true,
        title: 'Upload Error',
        message: `Failed to process files: ${error.message}`,
        type: 'error',
        showCancel: false,
        onConfirm: null
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear all results
  const handleClearResults = async () => {
    setModal({
      isOpen: true,
      title: 'Clear All Results',
      message: 'Are you sure you want to clear all results? This action cannot be undone.',
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.clearResults();
          await loadData();
          setProcessingQueue([]);
          setModal({
            isOpen: true,
            title: 'Success',
            message: 'All results cleared successfully!',
            type: 'success',
            showCancel: false,
            onConfirm: null
          });
        } catch (error) {
          console.error('Error clearing results:', error);
          setModal({
            isOpen: true,
            title: 'Error',
            message: 'Failed to clear results. Please try again.',
            type: 'error',
            showCancel: false,
            onConfirm: null
          });
        }
      }
    });
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
    <div className="app">
      <Header />
      
      <div className="main-container">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload</span>
            </button>

            <button 
              className={`nav-tab ${activeTab === 'processing' ? 'active' : ''}`}
              onClick={() => setActiveTab('processing')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Processing</span>
              {processingQueue.length > 0 && (
                <span className="badge">{processingQueue.length}</span>
              )}
            </button>

            <button 
              className={`nav-tab ${activeTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistics')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Statistics</span>
            </button>

            <button 
              className={`nav-tab ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => setActiveTab('review')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Review</span>
            </button>

            <button 
              className={`nav-tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Results</span>
              {results.length > 0 && (
                <span className="badge">{results.length}</span>
              )}
            </button>
          </nav>

          {results.length > 0 && (
            <div className="sidebar-footer">
              <button 
                className="clear-btn"
                onClick={handleClearResults}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Results
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="content">
          {activeTab === 'upload' && (
            <div className="tab-content fade-in">
              <FileUpload 
                onFilesUpload={handleFilesUpload}
                isProcessing={isProcessing}
                batchSize={batchSize}
                onChangeBatchSize={setBatchSize}
              />
            </div>
          )}

          {activeTab === 'processing' && (
            <div className="tab-content fade-in">
              <ProcessingQueue 
                queue={processingQueue}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="tab-content fade-in">
              <Statistics 
                statistics={statistics}
                results={results}
              />
            </div>
          )}

          {activeTab === 'review' && (
            <div className="tab-content fade-in">
              <ReviewGallery 
                results={results}
              />
            </div>
          )}

          {activeTab === 'results' && (
            <div className="tab-content fade-in">
              <ResultsGallery 
                results={results}
                onRefresh={loadData}
              />
            </div>
          )}
        </main>
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

export default App;
