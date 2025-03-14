import CompressionHandler from './compressionHandler.js';

class AssetLoader {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.loadingPromises = [];
    }

    async loadCompressedFile(file) {
        if (!CompressionHandler.isCompressedFile(file)) {
            throw new Error('Not a compressed file');
        }
        try {
            const decompressedFiles = await CompressionHandler.decompressFile(file);
            return decompressedFiles;
        } catch (error) {
            console.error('Error loading compressed file:', error);
            throw error;
        }
    }

    loadImage(key, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
            img.src = path;
        });
    }

    loadSound(key, path) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.sounds[key] = audio;
                resolve(audio);
            };
            audio.onerror = () => reject(new Error(`Failed to load sound: ${path}`));
            audio.src = path;
        });
    }

    async loadAll() {
        try {
            // Load symbol images
            await Promise.all([
                this.loadImage('gold', '/assets/symbols/gold.png'),
                this.loadImage('diamond', '/assets/symbols/diamond.png'),
                this.loadImage('club', '/assets/symbols/club.png'),
                this.loadImage('heart', '/assets/symbols/heart.png'),
                this.loadImage('spade', '/assets/symbols/spade.png'),
                this.loadImage('small_joker', '/assets/symbols/small_joker.png'),
                this.loadImage('big_joker', '/assets/symbols/big_joker.png'),
            ]);

            // Load sound effects using existing sounds
            await Promise.all([
                this.loadSound('spin', '/assets/sounds/spin.mp3'),
                this.loadSound('win', '/assets/sounds/excellent.mp3'),
                this.loadSound('big_win', '/assets/sounds/wow.mp3'),
                this.loadSound('free_spins_trigger', '/assets/sounds/lucky.mp3'),
            ]);

            return true;
        } catch (error) {
            console.error('Asset loading failed:', error);
            return false;
        }
    }

    getImage(key) {
        return this.images[key];
    }

    playSound(key) {
        const sound = this.sounds[key];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => console.error('Sound playback failed:', error));
        }
    }

    stopSound(key) {
        const sound = this.sounds[key];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }
}

export default AssetLoader;