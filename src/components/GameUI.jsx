import React, { useEffect, useState, useRef } from 'react';
import LoadingScreen from './LoadingScreen/index.jsx';
import AssetLoader from '../utils/assetLoader';
import MegaAceGame from '../utils/gameLogic';
import { audioManager } from '../utils/audioManager';
import '../styles/GameUI.css';

const GameUI = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [assetLoader] = useState(new AssetLoader());
    const [game] = useState(new MegaAceGame());
    const [grid, setGrid] = useState([]);
    const [gameState, setGameState] = useState({
        balance: 2000.00,
        betAmount: 3,
        multiplier: 1,
        isSpinning: false,
        winAmount: 0.00,
        autoSpinActive: false,
        autoSpinCount: 0
    });
    const autoSpinIntervalRef = useRef(null);

    useEffect(() => {
        const loadAssets = async () => {
            const loaded = await assetLoader.loadAll();
            if (loaded) {
                setIsLoading(false);
                setGrid(game.generateGrid());
                // Play game-open sound immediately after loading
                audioManager.playSound('gameOpen');
                // Start background music
                audioManager.playSound('gamePlay3');
            }
        };
        loadAssets();

        // Cleanup auto-spin on unmount
        return () => {
            if (autoSpinIntervalRef.current) {
                clearInterval(autoSpinIntervalRef.current);
            }
        };
    }, [assetLoader, game]);

    // Handle auto-spin functionality
    useEffect(() => {
        if (gameState.autoSpinActive && gameState.autoSpinCount > 0 && !gameState.isSpinning) {
            autoSpinIntervalRef.current = setTimeout(() => {
                handleSpin();
            }, 1000);
        } else if (gameState.autoSpinCount === 0 && gameState.autoSpinActive) {
            setGameState(prev => ({ ...prev, autoSpinActive: false }));
        }
    }, [gameState.autoSpinActive, gameState.autoSpinCount, gameState.isSpinning]);

    const handleSpin = async () => {
        if (gameState.isSpinning) return;
        
        // Play spin sound
        audioManager.playSound('spin');
        
        setGameState(prev => ({
            ...prev,
            isSpinning: true,
            winAmount: 0,
            autoSpinCount: prev.autoSpinActive ? prev.autoSpinCount - 1 : prev.autoSpinCount,
            balance: prev.balance - prev.betAmount
        }));
        
        const newGrid = game.generateGrid();
        setGrid(newGrid);
    
        // Add dramatic stop sequence
        await new Promise(resolve => setTimeout(resolve, 2000));
    
        // Play stop sound
        audioManager.playSound('stop');
    
        const result = game.calculateWinnings(gameState.betAmount);
        
        // Play win sounds based on win amount and symbols
        if (result.winAmount > 0) {
            const symbolType = grid[0][0]; // Get the winning symbol
            const isGolden = symbolType === 'GOLD';
            audioManager.playWinSound(symbolType, isGolden, result.multiplier, result.winAmount);
        }
        
        setGameState(prev => ({
            ...prev,
            isSpinning: false,
            winAmount: result.winAmount,
            multiplier: result.multiplier,
            balance: prev.balance + result.winAmount
        }));
    };

    const toggleExtraBet = () => {
        setGameState(prev => ({
            ...prev,
            extraBetActive: !prev.extraBetActive,
            betAmount: !prev.extraBetActive ? prev.betAmount * 2 : prev.betAmount / 2
        }));
        game.extraBetActive = !gameState.extraBetActive;
    };

    const toggleAutoSpin = () => {
        if (gameState.autoSpinActive) {
            // Stop auto-spin
            if (autoSpinIntervalRef.current) {
                clearTimeout(autoSpinIntervalRef.current);
                autoSpinIntervalRef.current = null;
            }
            setGameState(prev => ({ ...prev, autoSpinActive: false, autoSpinCount: 0 }));
        } else {
            // Start auto-spin with 10 spins
            setGameState(prev => ({ ...prev, autoSpinActive: true, autoSpinCount: 10 }));
        }
    };

    const toggleRapidSpin = () => {
        setGameState(prev => ({ ...prev, rapidSpinActive: !prev.rapidSpinActive }));
    };

    const renderSlotCell = (symbol, index) => (
        <div key={index} className={`slot-cell ${symbol.isWinning ? 'winning' : ''}`}>
            <img 
                src={SYMBOL_MAP[symbol.value]} 
                alt={symbol.value}
                className={`symbol-image ${gameState.isSpinning ? 'spinning' : 'stop-spin'}`}
            />
        </div>
    );

    const renderSlotGrid = () => (
        <div className="slot-grid">
            {grid.flat().map((symbol, index) => renderSlotCell(symbol, index))}
        </div>
    );

    return (
        <>
            {isLoading ? <LoadingScreen /> : (
                <div className="game-container">
                    <div className="game-header">
                        <h1 className="game-title">MEGA ACE</h1>
                    </div>

                    <div className="multiplier-bar">
                        {[1, 2, 3, 4, 5].map((mult, index) => (
                            <div key={index} className={`multiplier-item ${gameState.multiplier === mult ? 'active' : ''}`}>
                                ×{mult}
                            </div>
                        ))}
                    </div>

                    {renderSlotGrid()}

                    <div className="game-footer">
                        <div className="win-display">WIN {gameState.winAmount.toFixed(2)}</div>
                        <div className="balance-display">Balance {gameState.balance.toFixed(2)}</div>
                        
                        <div className="game-controls">
                            <button 
                                className="bet-button"
                                onClick={() => setGameState(prev => ({
                                    ...prev,
                                    betAmount: prev.betAmount < 100 ? prev.betAmount + 1 : 1
                                }))}
                            >
                                <span>BET</span>
                                <span className="bet-amount">{gameState.betAmount}</span>
                            </button>

                            <button 
                                className={`spin-button ${gameState.isSpinning ? 'disabled' : ''}`}
                                onClick={handleSpin}
                                disabled={gameState.isSpinning}
                            >
                                <span>SPIN</span>
                            </button>
                            
                            <button 
                                className={`auto-spin-button ${gameState.autoSpinActive ? 'active' : ''}`}
                                onClick={toggleAutoSpin}
                                disabled={gameState.isSpinning}
                            >
                                <span>AUTO {gameState.autoSpinActive ? gameState.autoSpinCount : ''}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GameUI;

const SYMBOL_MAP = {
    'spade': '/assets/symbols/spade.png',
    'heart': '/assets/symbols/heart.png',
    'diamond': '/assets/symbols/diamond.png',
    'club': '/assets/symbols/club.png',
    'gold': '/assets/symbols/gold.png',
    'ace': '/assets/symbols/ace.png',
    'small_joker': '/assets/symbols/small_joker.png',
    'big_joker': '/assets/symbols/big_joker.png',
    '7': '/assets/symbols/7.jpg',
    '8': '/assets/symbols/8.png',
    '9': '/assets/symbols/9.jpg',
    'J': '/assets/symbols/jack.png',
    'Q': '/assets/symbols/queen.png',
    'K': '/assets/symbols/king.png',
    'wild': '/assets/symbols/wild.png',
    'scatter': '/assets/symbols/scatter.png'
};