import { useState, useEffect } from 'react';
import gameApi from '../services/gameApi';

const useGameState = () => {
    const [balance, setBalance] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [freeSpinsCount, setFreeSpinsCount] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [gameGrid, setGameGrid] = useState([]);
    const [winAmount, setWinAmount] = useState(0);

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = async () => {
        try {
            const { data } = await gameApi.initializeGame();
            setBalance(data.balance);
            setGameGrid(data.initialGrid);
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    };

    const handleSpin = async (betAmount) => {
        try {
            setIsSpinning(true);
            const { data } = await gameApi.spin(betAmount);
            
            setGameGrid(data.grid);
            setBalance(data.balance);
            setWinAmount(data.winAmount);
            
            if (data.freeSpinsTriggered) {
                setFreeSpinsCount(data.freeSpinsCount);
            }
            
            setMultiplier(data.multiplier);
        } catch (error) {
            console.error('Spin failed:', error);
        } finally {
            setIsSpinning(false);
        }
    };

    return {
        balance,
        isSpinning,
        freeSpinsCount,
        multiplier,
        gameGrid,
        winAmount,
        handleSpin
    };
};

export default useGameState;