import React, { useState, useEffect } from 'react';
import { runAllApiTests } from '../../tests/runAllTests';

const TestRunner = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  // Override console.log to capture logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      setLogs(prevLogs => [...prevLogs, { type: 'log', content: args.join(' ') }]);
      originalLog(...args);
    };

    console.error = (...args) => {
      setLogs(prevLogs => [...prevLogs, { type: 'error', content: args.join(' ') }]);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setLogs([]);
    setTestResults(null);

    try {
      const results = await runAllApiTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults({
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        success: false,
        error: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mt-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <h2>API Gateway Test Runner</h2>

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <h4>Run All API Tests</h4>
        <p>This will execute comprehensive tests across all API services connected to the gateway.</p>
        <button
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1
          }}
          onClick={runTests}
          disabled={isRunning}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
        <button
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
            opacity: logs.length === 0 ? 0.6 : 1,
            marginLeft: '10px'
          }}
          onClick={clearLogs}
          disabled={logs.length === 0}
        >
          Clear Logs
        </button>
      </div>

      {testResults && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <h4>Test Results</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{
              textAlign: 'center',
              padding: '15px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              flex: 1,
              marginRight: '10px'
            }}>
              <h4 style={{ margin: 0, color: '#333' }}>{testResults.total}</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Tests</p>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '15px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '4px',
              border: '1px solid #c3e6cb',
              flex: 1,
              marginRight: '10px'
            }}>
              <h4 style={{ margin: 0 }}>{testResults.passed}</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>Passed</p>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '15px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '4px',
              border: '1px solid #f5c6cb',
              flex: 1,
              marginRight: '10px'
            }}>
              <h4 style={{ margin: 0 }}>{testResults.failed}</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>Failed</p>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '15px',
              backgroundColor: '#fff3cd',
              color: '#856404',
              borderRadius: '4px',
              border: '1px solid #ffeaa7',
              flex: 1
            }}>
              <h4 style={{ margin: 0 }}>{testResults.skipped}</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>Skipped</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: testResults.total > 0 ? `${(testResults.passed / testResults.total) * 100}%` : '0%',
                  backgroundColor: '#28a745',
                  transition: 'width 0.3s'
                }}
              ></div>
              <div
                style={{
                  width: testResults.total > 0 ? `${(testResults.failed / testResults.total) * 100}%` : '0%',
                  backgroundColor: '#dc3545',
                  transition: 'width 0.3s'
                }}
              ></div>
              <div
                style={{
                  width: testResults.total > 0 ? `${(testResults.skipped / testResults.total) * 100}%` : '0%',
                  backgroundColor: '#ffc107',
                  transition: 'width 0.3s'
                }}
              ></div>
            </div>
          </div>

          {testResults.error && (
            <div style={{
              padding: '15px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              marginBottom: '15px'
            }}>
              <strong>Error:</strong> {testResults.error}
            </div>
          )}

          {testResults.success ? (
            <div style={{
              padding: '15px',
              backgroundColor: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
              borderRadius: '4px'
            }}>
              <strong>All tests passed!</strong> The API gateway is functioning correctly.
            </div>
          ) : testResults.total > 0 && (
            <div style={{
              padding: '15px',
              backgroundColor: '#fff3cd',
              color: '#856404',
              border: '1px solid #ffeaa7',
              borderRadius: '4px'
            }}>
              <strong>Some tests failed.</strong> Please check the logs below for details.
            </div>
          )}
        </div>
      )}

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '0',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold'
        }}>
          <h5 style={{ margin: 0 }}>Test Logs</h5>
        </div>
        <div
          style={{
            height: '400px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            backgroundColor: '#f8f9fa',
            padding: '15px',
            fontSize: '14px'
          }}
        >
          {logs.length === 0 ? (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No logs yet. Run tests to see output.</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  color: log.type === 'error' ? '#dc3545' : '#333',
                  marginBottom: '5px',
                  lineHeight: '1.4'
                }}
              >
                {log.content}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRunner;