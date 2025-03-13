import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Game.css';
import { audioManager } from '../utils/audioManager';
import SoundControls from './SoundControls';

const Game = () => {
    // Consolidated state declarations
    const [isLoading, setIsLoading] = useState(true);
    const [balance, setBalance] = useState(10000);
    const [betAmount, setBetAmount] = useState(100);
    const [spinning, setSpinning] = useState(false);
    const [grid, setGrid] = useState([]);
    const [userId, setUserId] = useState(null);
    const [winAmount, setWinAmount] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [winningLines, setWinningLines] = useState([]);
    const [symbols] = useState(["gold", "diamond", "club", "heart", "spade", "small_joker", "big_joker"]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [autoSpin, setAutoSpin] = useState(false);


    useEffect(() => {
        const loadGame = async () => {
            try {
                await initializeUser();
                createInitialGrid();
                setTimeout(() => setIsLoading(false), 1500);
            } catch (error) {
                console.error('Game initialization failed:', error);
            }
        };
        loadGame();
    }, []);

    const createInitialGrid = () => {
        const initialGrid = Array.from({ length: 6 }, () => 
            Array.from({ length: 6 }, () => "?")
        );
        setGrid(initialGrid);
    };

    const initializeUser = async () => {
        try {
            // Changed from '/api/user/create' to match backend route
            const response = await axios.post('/api/user', {
                username: 'Player1'
            });
            setUserId(response.data.id);
            setBalance(response.data.balance);
        } catch (error) {
            console.error('Failed to initialize user:', error);
            alert('Failed to connect to the server. Please ensure the server is running.');
        }
    };

    const animateReels = () => {
        setIsAnimating(true);
        audioManager.playSound('spin');
        // Animation will be handled by CSS
        setTimeout(() => setIsAnimating(false), 3000);
    };

    const handleWin = (winAmount, multiplier) => {
        if (winAmount > 0) {
            // Play win sounds based on multiplier and symbols
            const symbolType = grid[0][0]; // Get the winning symbol
            const isGolden = symbolType === 'gold';
            audioManager.playWinSound(symbolType.toLowerCase(), isGolden, multiplier, winAmount);
        }
    };

    const spin = async () => {
        if (spinning || !userId || isAnimating) return;
        setSpinning(true);
        animateReels();

        try {
            const response = await axios.post(`/api/user/${userId}/bet`, {
                betAmount: betAmount
            });

            setTimeout(() => {
                setGrid(response.data.grid);
                setBalance(response.data.balance);
                setWinAmount(response.data.winAmount);
                setMultiplier(response.data.multiplier);
                setWinningLines(response.data.winningLines);
                handleWin(response.data.winAmount, response.data.multiplier);
                setSpinning(false);
            }, 3000);

        } catch (error) {
            console.error('Spin failed:', error);
            alert('Spin failed. Please try again.');
            setSpinning(false);
        }
    };

    const startAutoSpin = () => {
        setAutoSpin(true);
        autoSpinSequence();
    };

    const stopAutoSpin = () => {
        setAutoSpin(false);
    };

    const autoSpinSequence = async () => {
        if (!autoSpin || balance < betAmount) {
            stopAutoSpin();
            return;
        }
        await spin();
        setTimeout(() => {
            if (autoSpin && balance >= betAmount) {
                autoSpinSequence();
            } else {
                stopAutoSpin();
            }
        }, 3500);
    };

    return (
        <div className="game-container">
            <SoundControls />
            {isLoading ? (
                <div className="loading-screen" style={{ backgroundImage: "url('/assets/ui/loading-background.jpg')" }}>
                    <img src="/assets/ui/Mega-Ace-logo.jpg" alt="Mega Ace Logo" className="game-logo" />
                    <img src="/assets/ui/loading-spinner.gif" alt="Loading..." className="loading-spinner" />
                    <div className="loading-text">Loading Mega Ace...</div>
                </div>
            ) : (
                <div className="slot-container">
                    <div className="multiplier-bar">
                        <span>Multiplier: x{multiplier}</span>
                    </div>
                    
                    <div className="reels">
                        {grid.map((row, rowIndex) => (
                            <div key={`row-${rowIndex}`} className="row">
                                {row.map((symbol, colIndex) => {
                                    // Update symbol mapping to match backend SYMBOLS
                                    const symbolMap = {
                                        "7": "7",
                                        "8": "8",
                                        "9": "9",
                                        "J": "jack",
                                        "Q": "queen", 
                                        "K": "king",
                                        "A": "ace",
                                        "big_joker": "big_joker",
                                        "small_joker": "small_joker",
                                        "wild": "wild",
                                        "scatter": "scatter",
                                        "gold": "gold",
                                        "club": "club",
                                        "diamond": "diamond",
                                        "heart": "heart",
                                        "spade": "spade"
                                    };
                                    
                                    // Ensure the image paths match the filenames in your assets directory
                                    const mappedSymbol = symbolMap[symbol] || symbol;
                                    const imagePath = `/assets/symbols/${mappedSymbol.toLowerCase()}.png`;

                                    return (
                                        <div 
                                            key={`${rowIndex}-${colIndex}`} 
                                            className={`slot-cell ${
                                                winningLines.some(line => 
                                                    (line.type === 'row' && line.index === rowIndex) ||
                                                    (line.type === 'column' && line.index === colIndex)
                                                ) ? 'winning' : ''
                                            }`}
                                        >
                                            <div className="symbol-debug">{symbol}</div>
                                            <img src={imagePath} alt={symbol} className="symbol-image" />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    
                    <div className="controls">
                        <div className="game-controls">
                            <div className="control-row">
                                <button 
                                    className="bet-button button"
                                    onClick={() => setBetAmount(prev => prev < 500 ? prev + 50 : 50)}
                                    disabled={spinning || autoSpin}
                                >
                                    Bet: {betAmount}
                                </button>
                                
                                <button 
                                    className="spin-button button"
                                    onClick={spin} 
                                    disabled={spinning || autoSpin || balance < betAmount}
                                >
                                    {spinning ? 'Spinning...' : 'SPIN'}
                                </button>
                                
                                <button
                                    className={`autospin-button button ${autoSpin ? 'active' : ''}`}
                                    onClick={autoSpin ? stopAutoSpin : startAutoSpin}
                                    disabled={spinning || balance < betAmount}
                                >
                                    {autoSpin ? 'STOP' : 'AUTO'}
                                </button>
                            </div>
                            
                            <div className="info-row">
                                <div className="balance">Balance: {balance}</div>
                                <div className="win">Win: {winAmount}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="info">
                        <div className="balance">Balance: {balance}</div>
                        <div className="win">Win: {winAmount}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;