const SYMBOLS = {
    gold: { value: 'gold', payout: 100, type: 'regular', weight: 1 },
    diamond: { value: 'diamond', payout: 80, type: 'regular', weight: 2 },
    club: { value: 'club', payout: 60, type: 'regular', weight: 3 },
    heart: { value: 'heart', payout: 50, type: 'regular', weight: 4 },
    spade: { value: 'spade', payout: 40, type: 'regular', weight: 5 },
    small_joker: { value: 'small_joker', payout: 0, type: 'wild', weight: 2 },
    big_joker: { value: 'big_joker', payout: 0, type: 'wild', weight: 1 }
};

class MegaAceGame {
    constructor(extraBet = false) {
        this.grid = Array(6).fill().map(() => Array(6).fill(null));
        this.multiplier = extraBet ? 2 : 1;
        this.consecutiveWins = 0;
        this.isFreeSpin = false;
        this.extraBetActive = extraBet;
        this.winRate = 0.8; // 80% win rate
        this.freeSpinsRemaining = 0;
        this.winStreak = 0;
        this.gameState = 'idle'; // idle, spinning, evaluating, freeSpin
        this.soundEffects = {
            spin: false,
            win: false,
            bigWin: false,
            freeSpin: false
        };
        this.goldenPositions = new Set();
        this.jokerPositions = new Map(); // Maps position to joker type and size
    }

    generateSymbol(col) {
        const symbol = this.getRandomSymbol();
        // golden cards only on reels 2-5
        const isgolden = col >= 1 && col <= 4 && Math.random() < 0.15;
        return {
            type: symbol,
            isgolden: isgolden,
            jokerType: null,
            jokerSize: 0
        };
    }

    async handleWinningSymbols(winningPositions) {
        for (const pos of winningPositions) {
            const symbol = this.grid[pos.row][pos.col];
            
            if (symbol.isgolden) {
                // Convert to Small Joker
                this.grid[pos.row][pos.col] = {
                    type: 'small_joker',
                    jokerType: 'small',
                    jokerSize: 1
                };
            } else if (symbol.type === 'small_joker') {
                // Convert to Big Joker
                const size = Math.floor(Math.random() * 4) + 1;
                this.grid[pos.row][pos.col] = {
                    type: 'big_joker',
                    jokerType: 'big',
                    jokerSize: size
                };
            } else if (symbol.type === 'big_joker') {
                await this.handleBigJokerEffect(pos);
            } else {
                this.grid[pos.row][pos.col] = null;
            }
        }
    }

    async handleBigJokerEffect(position) {
        const joker = this.grid[position.row][position.col];
        const positions = this.getRandomPositions(joker.jokerSize);
        
        for (const pos of positions) {
            const randomSymbol = this.getRandomSymbol();
            this.grid[pos.row][pos.col] = {
                type: randomSymbol,
                isgolden: Math.random() < 0.15,
                jokerType: null,
                jokerSize: 0
            };
        }
    }

    getRandomPositions(count) {
        const positions = [];
        const available = [];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                available.push({ row, col });
            }
        }
        
        for (let i = 0; i < count && available.length > 0; i++) {
            const index = Math.floor(Math.random() * available.length);
            positions.push(available.splice(index, 1)[0]);
        }
        
        return positions;
    }

    generateGrid() {
        // Determine if this spin should be a win based on win rate
        const isWinningSpinForced = Math.random() < this.winRate;

        if (isWinningSpinForced) {
            return this.generateWinningGrid();
        }

        const regularSymbols = Object.values(SYMBOLS).filter(s => s.type === 'regular');
        this.grid = this.grid.map(row =>
            row.map(() => {
                const totalWeight = regularSymbols.reduce((sum, symbol) => sum + symbol.weight, 0);
                let random = Math.random() * totalWeight;
                
                for (const symbol of regularSymbols) {
                    random -= symbol.weight;
                    if (random <= 0) return symbol;
                }
                return regularSymbols[0];
            })
        );
        return this.grid;
    }

    generateWinningGrid() {
        // Generate a winning grid with at least one winning combination
        const regularSymbols = Object.values(SYMBOLS).filter(s => s.type === 'regular');
        const winningSymbol = regularSymbols[Math.floor(Math.random() * regularSymbols.length)];
        
        // Generate random grid
        this.grid = this.grid.map(row =>
            row.map(() => {
                const random = Math.random();
                // 60% chance to get the winning symbol in winning spins
                return random < 0.6 ? winningSymbol : regularSymbols[Math.floor(Math.random() * regularSymbols.length)];
            })
        );

        // Ensure at least one column is winning
        const randomColumn = Math.floor(Math.random() * 6);
        for (let row = 0; row < 6; row++) {
            this.grid[row][randomColumn] = winningSymbol;
        }

        return this.grid;
    }

    updateMultiplier() {
        if (this.isFreeSpin) {
            this.multiplier = Math.min(10, this.multiplier + this.consecutiveWins);
        } else {
            this.multiplier = Math.min(5, this.extraBetActive ? 2 + this.consecutiveWins : 1 + this.consecutiveWins);
        }
    }

    processWildTransformations() {
        // Process gold Set eliminations to Small Jokers
        let smallJokerPositions = [];
        this.grid.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if (symbol.value === 'gold' && Math.random() < 0.3) {
                    this.grid[i][j] = SYMBOLS.small_joker;
                    smallJokerPositions.push([i, j]);
                }
            });
        });

        // Process Small Jokers to Big Jokers
        if (smallJokerPositions.length > 0 && Math.random() < 0.2) {
            const randomPosition = smallJokerPositions[Math.floor(Math.random() * smallJokerPositions.length)];
            this.grid[randomPosition[0]][randomPosition[1]] = SYMBOLS.big_joker;
            this.transformAdjacentSymbols(randomPosition[0], randomPosition[1]);
        }
    }

    transformAdjacentSymbols(bigJokerRow, bigJokerCol) {
        const numTransforms = Math.floor(Math.random() * 3) + 3; // 3 to 5 transformations
        const positions = this.getAdjacentPositions(bigJokerRow, bigJokerCol);
        
        for (let i = 0; i < numTransforms && positions.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            const [row, col] = positions.splice(randomIndex, 1)[0];
            this.grid[row][col] = SYMBOLS.small_joker;
        }
    }

    getAdjacentPositions(row, col) {
        const positions = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6) {
                    positions.push([newRow, newCol]);
                }
            }
        }
        return positions;
    }

    animateWinningSymbols(winningLines) {
        const animationPromises = [];
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        // Process each winning line
        for (const line of winningLines) {
            const column = line.column;
            for (let row = 0; row < 6; row++) {
                animationPromises.push(
                    this.animateAndReplaceSymbol(row, column, line.symbol)
                );
            }
        }

        return Promise.all(animationPromises);
    }

    async animateAndReplaceSymbol(row, column, winningSymbol) {
        // Step 1: Glow effect (1 second)
        this.grid[row][column].isGlowing = true;
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Fade out (500ms)
        this.grid[row][column].isFading = true;
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 3: Replace with new symbol
        const regularSymbols = Object.values(SYMBOLS).filter(s => s.type === 'regular');
        let newSymbol;
        do {
            newSymbol = regularSymbols[Math.floor(Math.random() * regularSymbols.length)];
        } while (newSymbol.value === winningSymbol);

        this.grid[row][column] = {
            ...newSymbol,
            isNew: true // Flag for animation
        };

        // Step 4: Drop in animation (300ms)
        await new Promise(resolve => setTimeout(resolve, 300));
        this.grid[row][column].isNew = false;
    }

    calculateWinnings(betAmount) {
        let totalWinnings = 0;
        const winningLines = [];

        // Calculate ways to win (46,656 possible ways)
        for (let col = 0; col < 6; col++) {
            let symbolsInColumn = this.grid.map(row => row[col]);
            let uniqueSymbols = new Set(symbolsInColumn.map(s => s.value));
            
            if (uniqueSymbols.size === 1 || uniqueSymbols.has('small_joker') || uniqueSymbols.has('big_joker')) {
                const baseSymbol = symbolsInColumn.find(s => s.type === 'regular');
                if (baseSymbol) {
                    totalWinnings += baseSymbol.payout;
                    winningLines.push({ line: col + 6, symbol: baseSymbol.value }); // Adjusted to match server format
                }
            }
        }

        // Check rows for winning lines (matching server implementation)
        for (let row = 0; row < 6; row++) {
            const rowSymbols = this.grid[row];
            const uniqueSymbols = new Set(rowSymbols.map(s => s.value));
            
            if (uniqueSymbols.size === 1 || uniqueSymbols.has('small_joker') || uniqueSymbols.has('big_joker')) {
                const baseSymbol = rowSymbols.find(s => s.type === 'regular');
                if (baseSymbol) {
                    totalWinnings += baseSymbol.payout;
                    winningLines.push({ line: row, symbol: baseSymbol.value }); // Matches server format
                }
            }
        }

        // Apply multiplier and animate
        totalWinnings *= this.multiplier * betAmount;

        // Trigger animations for winning lines
        if (winningLines.length > 0) {
            this.animateWinningSymbols(winningLines).then(() => {
                this.processWildTransformations();
            });
        }

        return {
            winAmount: totalWinnings,
            multiplier: this.multiplier,
            winningLines,
            animationComplete: false
        };
    }

    // Update animation method to handle both row and column wins
    async animateAndReplaceSymbol(row, column, winningSymbol) {
        const cell = this.grid[row][column];
        
        // Step 1: Rapid spin effect
        cell.isSpinning = true;
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 2: Glow effect with pulsating intensity
        cell.isGlowing = true;
        cell.glowIntensity = 0;
        for (let i = 0; i < 3; i++) { // Pulse 3 times
            cell.glowIntensity = 1;
            await new Promise(resolve => setTimeout(resolve, 200));
            cell.glowIntensity = 0.5;
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Step 3: Fade out with sparkle effect
        cell.isFading = true;
        cell.hasSparkles = true;
        await new Promise(resolve => setTimeout(resolve, 400));

        // Step 4: Replace with new random symbol
        const regularSymbols = Object.values(SYMBOLS).filter(s => s.type === 'regular');
        let newSymbol;
        do {
            newSymbol = regularSymbols[Math.floor(Math.random() * regularSymbols.length)];
        } while (newSymbol.value === winningSymbol);

        this.grid[row][column] = {
            ...newSymbol,
            isNew: true,
            isSpinning: false,
            isGlowing: false,
            glowIntensity: 0,
            hasSparkles: false,
            dropDistance: '100%' // For smooth drop-in animation
        };

        // Step 5: Smooth drop-in animation
        await new Promise(resolve => setTimeout(resolve, 50)); // Brief pause before drop
        this.grid[row][column].dropDistance = '0%';
        await new Promise(resolve => setTimeout(resolve, 300));
        this.grid[row][column].isNew = false;
    }

    // Update animation trigger to handle both row and column wins
    animateWinningSymbols(winningLines) {
        const animationPromises = [];

        for (const line of winningLines) {
            if (line.line < 6) {
                // Row win
                for (let col = 0; col < 6; col++) {
                    animationPromises.push(
                        this.animateAndReplaceSymbol(line.line, col, line.symbol)
                    );
                }
            } else {
                // Column win
                const col = line.line - 6;
                for (let row = 0; row < 6; row++) {
                    animationPromises.push(
                        this.animateAndReplaceSymbol(row, col, line.symbol)
                    );
                }
            }
        }

        return Promise.all(animationPromises);
    }

    // Add after generateGrid method
    checkForFreeSpins() {
        let goldCount = 0;
        this.grid.forEach(row => {
            row.forEach(symbol => {
                if (symbol.value === 'gold') goldCount++;
            });
        });

        if (goldCount >= 3) {
            this.freeSpinsRemaining += 8; // Award 8 free spins
            this.soundEffects.freeSpin = true;
            return true;
        }
        return false;
    }

    // Add after calculateWinnings method
    handleWinStreak(hasWon) {
        if (hasWon) {
            this.winStreak++;
            if (this.winStreak >= 3) {
                this.soundEffects.bigWin = true;
            } else {
                this.soundEffects.win = true;
            }
        } else {
            this.winStreak = 0;
        }
        this.updateMultiplier();
    }

    // Modify spin logic
    async spin(betAmount) {
        this.gameState = 'spinning';
        this.soundEffects = { spin: true, win: false, bigWin: false, freeSpin: false };

        const result = {
            grid: this.generateGrid(),
            freeSpinsAwarded: 0,
            winAmount: 0,
            multiplier: this.multiplier,
            winningLines: [],
            soundEffects: this.soundEffects,
            gameState: this.gameState
        };

        // Check for free spins first
        if (this.checkForFreeSpins()) {
            result.freeSpinsAwarded = 8;
        }

        // Calculate winnings
        const winResults = this.calculateWinnings(betAmount);
        Object.assign(result, winResults);

        // Update win streak and handle animations
        this.handleWinStreak(winResults.winAmount > 0);
        
        // Update game state
        this.gameState = this.freeSpinsRemaining > 0 ? 'freeSpin' : 'idle';
        result.gameState = this.gameState;

        return result;
    }

    // Add method to handle free spins
    async playFreeSpin(betAmount) {
        if (this.freeSpinsRemaining <= 0) return null;
        
        this.isFreeSpin = true;
        this.freeSpinsRemaining--;
        
        const result = await this.spin(betAmount);
        result.freeSpinsRemaining = this.freeSpinsRemaining;
        
        if (this.freeSpinsRemaining === 0) {
            this.isFreeSpin = false;
        }
        
        return result;
    }

    async handleCascade() {
        let hasCascaded = false;
        
        // Remove winning symbols
        const winningPositions = this.getWinningPositions();
        if (winningPositions.length > 0) {
            hasCascaded = true;
            await this.removeWinningSymbols(winningPositions);
            await this.dropSymbols();
            await this.fillNewSymbols();
            
            // Check for new wins and cascade again if needed
            const newWins = this.checkForWins();
            if (newWins) {
                await this.handleCascade();
            }
        }
        
        return hasCascaded;
    }

    async removeWinningSymbols(positions) {
        return new Promise(resolve => {
            positions.forEach(pos => {
                this.grid[pos.row][pos.col] = null;
            });
            setTimeout(resolve, 500); // Animation time
        });
    }

    async dropSymbols() {
        return new Promise(resolve => {
            for (let col = 0; col < 6; col++) {
                let emptySpaces = 0;
                for (let row = 5; row >= 0; row--) {
                    if (this.grid[row][col] === null) {
                        emptySpaces++;
                    } else if (emptySpaces > 0) {
                        this.grid[row + emptySpaces][col] = this.grid[row][col];
                        this.grid[row][col] = null;
                    }
                }
            }
            setTimeout(resolve, 300); // Drop animation time
        });
    }

    getRandomSymbol() {
        const regularSymbols = Object.values(SYMBOLS).filter(s => s.type === 'regular');
        const totalWeight = regularSymbols.reduce((sum, symbol) => sum + symbol.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const symbol of regularSymbols) {
            random -= symbol.weight;
            if (random <= 0) return symbol.value;
        }
        return regularSymbols[0].value;
    }

    async fillNewSymbols() {
        return new Promise(resolve => {
            for (let col = 0; col < 6; col++) {
                for (let row = 0; row < 6; row++) {
                    if (this.grid[row][col] === null) {
                        const symbol = this.getRandomSymbol();
                        this.grid[row][col] = {
                            type: symbol,
                            isgolden: col >= 1 && col <= 4 && Math.random() < 0.15,
                            jokerType: null,
                            jokerSize: 0
                        };
                    }
                }
            }
            setTimeout(resolve, 300); // New symbols animation time
        });
    }
}

export default MegaAceGame;