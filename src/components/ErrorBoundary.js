import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    color: '#ffd700' 
                }}>
                    <h1>Something went wrong.</h1>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#ff9900',
                            border: '2px solid #ffd700',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Game
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;