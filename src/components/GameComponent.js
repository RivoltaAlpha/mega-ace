import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './GameComponent.css';

const GameComponent = () => {
    const [balance, setBalance] = useState(2000);
    const [betAmount, setBetAmount] = useState(100);
    const [spinning, setSpinning] = useState(false);
    const [grid, setGrid] = useState([]);
    const [userId, setUserId] = useState(null);
    const [autoSpinning, setAutoSpinning] = useState(false);

    useEffect(() => {
        // Initialize user and get initial balance
        initializeUser();
        createSlotGrid();
    }, []);

    const initializeUser = async () => {
        try {
            const response = await axios.post('http://localhost:3001/user', { username: 'Player1' });
            setUserId(response.data.id);
            setBalance(response.data.balance);
        } catch (error) {
            console.error('Failed to initialize user:', error);
        }
    };

    const createSlotGrid = () => {
        const initialGrid = Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => "?"));
        setGrid(initialGrid);
    };

    const symbols = {
        // Card symbols (to be added in assets/symbols)
        "7": "/assets/symbols/7.png",
        "8": "/assets/symbols/8.png",
        "9": "/assets/symbols/9.png",
        "10": "/assets/symbols/10.png",
        "J": "/assets/symbols/J.png",
        "Q": "/assets/symbols/Q.png",
        "K": "/assets/symbols/K.png",
        "A": "/assets/symbols/A.png",
        "WILD": "/assets/symbols/wild.png",
        "SCATTER": "/assets/symbols/scatter.png",
        // Game UI elements from game_images
        "multiplier": "/assets/game_images/multiplier.png",
        "win_frame": "/assets/game_images/win_frame.png",
        "congrats": "/assets/game_images/congrats.png",
        "balance_frame": "/assets/game_images/balance_frame.png"
    };

    // Update the spin function to use the new symbols
    const spin = async () => {
        if (spinning || !userId) return;
        setSpinning(true);

        try {
            // Generate a balanced grid locally instead of waiting for server response
            const symbolKeys = Object.keys(symbols).filter(key => !['multiplier', 'win_frame', 'congrats', 'balance_frame'].includes(key));
            const gridSize = 6;
            const minSymbolCount = Math.ceil((gridSize * gridSize) / (2 * symbolKeys.length)); // Ensure each symbol appears at least half of its fair share
            
            let newGrid = [];
            let symbolCounts = {};
            symbolKeys.forEach(key => symbolCounts[key] = 0);

            // First pass: ensure minimum distribution
            for (let i = 0; i < gridSize; i++) {
                newGrid[i] = [];
                for (let j = 0; j < gridSize; j++) {
                    const availableSymbols = symbolKeys.filter(key => symbolCounts[key] < minSymbolCount);
                    const symbol = availableSymbols.length > 0 ?
                        availableSymbols[Math.floor(Math.random() * availableSymbols.length)] :
                        symbolKeys[Math.floor(Math.random() * symbolKeys.length)];
                    
                    newGrid[i][j] = symbol;
                    symbolCounts[symbol]++;
                }
            }

            setGrid(newGrid);

            const response = await axios.post(`http://localhost:3001/user/${userId}/bet`, {
                betAmount: betAmount,
                grid: newGrid
            });

            setBalance(response.data.newBalance);

            if (response.data.winAmount > 0) {
                // Add winning animation logic here
            }
        } catch (error) {
            console.error('Spin failed:', error);
        } finally {
            setSpinning(false);
            if (autoSpinning) {
                setTimeout(spin, 2000);
            }
        }
    };

    const handleAutoSpin = () => {
        if (autoSpinning) {
            setAutoSpinning(false);
        } else {
            setAutoSpinning(true);
            spin();
        }
    };

    return (
        <div className="game-container">
            <h1>Mega Ace Slot</h1>
            <div className="slot-container">
                <div className="multiplier-bar">x1 x2 x3 x4 x5</div>
                <div className="reels">
                    {grid.map((row, rowIndex) => (
                        row.map((symbol, colIndex) => (
                            <div key={`${rowIndex}-${colIndex}`} className="slot-cell">{symbol}</div>
                        ))
                    ))}
                </div>
                <div className="controls">
                    <button className="button spin-button" onClick={spin} disabled={spinning}>SPIN</button>
                    <button className="button auto-spin-button" onClick={handleAutoSpin}>
                        {autoSpinning ? 'STOP' : 'AUTO SPIN'}
                    </button>
                </div>
                <div className="balance-container">
                    Balance: <span>{balance}</span>
                </div>
                <div className="bet-container">
                    Bet Amount: <span>{betAmount}</span>
                </div>
            </div>
        </div>
    );
};

export default GameComponent;