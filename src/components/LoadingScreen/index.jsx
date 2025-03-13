import React, { useEffect, useState } from 'react';
import './styles.css';

const LoadingScreen = () => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Add a longer delay before starting the fade-out
        const timer = setTimeout(() => {
            setFadeOut(true);
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
            <img src="/assets/ui/Mega-Ace-logo.jpg" alt="Mega Ace Logo" className="game-logo" />
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading Mega Ace...</div>
        </div>
    );
};

export default LoadingScreen;