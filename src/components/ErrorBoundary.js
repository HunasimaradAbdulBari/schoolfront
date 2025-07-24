import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    console.log('Reload button clicked');
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    console.log('Go to Login button clicked');
    console.log('Current URL:', window.location.href);
    console.log('Origin:', window.location.origin);
    
    // Clear the error state
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Try multiple navigation methods
    const loginUrl = window.location.origin + '/#/login';
    console.log('Attempting to navigate to:', loginUrl);
    
    try {
      // Method 1: Direct href change
      window.location.href = loginUrl;
    } catch (e) {
      console.error('Method 1 failed:', e);
      try {
        // Method 2: Hash change
        window.location.hash = '#/login';
      } catch (e2) {
        console.error('Method 2 failed:', e2);
        // Method 3: Replace entire location
        window.location.replace(loginUrl);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{
              color: '#dc3545',
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              🚨 Something went wrong!
            </h1>
            
            <p style={{
              color: '#666',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {/* Debug info */}
            <div style={{
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              fontSize: '12px',
              textAlign: 'left'
            }}>
              <strong>Debug Info:</strong><br/>
              Current URL: {window.location.href}<br/>
              Hash: {window.location.hash}<br/>
              Origin: {window.location.origin}
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                textAlign: 'left'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Error Details (Development Mode)
                </summary>
                <pre style={{
                  marginTop: '10px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🔄 Reload Page
              </button>
              
              <button 
                onClick={this.handleGoHome}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🏠 Go to Login
              </button>

              {/* Additional test buttons */}
              <button 
                onClick={() => {
                  console.log('Testing hash navigation...');
                  window.location.hash = '#/login';
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ffc107',
                  color: 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Test Hash Navigation
              </button>

              <button 
                onClick={() => {
                  console.log('Testing window.location.replace...');
                  window.location.replace('/#/login');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Test Replace
              </button>
            </div>

            <p style={{
              marginTop: '20px',
              fontSize: '12px',
              color: '#999'
            }}>
              If this problem persists, please contact support. Check browser console for debug logs.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;