import React from 'react';
import './App.css';
import GameUI from './components/GameUI.jsx';
import ErrorBoundary from './components/ErrorBoundary.js';

function App() {
    return (
        <div className="App">
            <ErrorBoundary>
                <GameUI />
            </ErrorBoundary>
        </div>
    );
}

export default App;
