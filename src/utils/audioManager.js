class AudioManager {
    constructor() {
        this.sounds = {};
        this.loadingPromises = [];
        this.soundPaths = {
            gameOpen: '/assets/sounds/game-open.mp3',
            gamePlay: '/assets/sounds/game-play.mp3',
            gamePlay3: '/assets/sounds/game-play3.mp3',
            spin: '/assets/sounds/spin.mp3',
            big_joker: '/assets/sounds/excellent.mp3',
            small_joker: '/assets/sounds/wow.mp3',
            gold: '/assets/sounds/lucky.mp3',
            jack: '/assets/sounds/jack.mp3',
            queen: '/assets/sounds/queen.mp3',
            ine: '/assets/sounds/9.mp3',
            scatter:'/assets/sounds/game-open.mp3',
            king: '/assets/sounds/king.mp3',
            ace: '/assets/sounds/ace.mp3',
            eight: '/assets/sounds/8.mp3',
            nine: '/assets/sounds/9.mp3',
            spade:'/assets/sounds/spade.mp3',
            heart: '/assets/sounds/heart.mp3',
            club:'/assets/sounds/club.mp3',
            diamond:'/assets/sounds/diamond.mp3',
            multiplier2x: '/assets/sounds/2-times.mp3',
            multiplier3x: '/assets/sounds/3-times.mp3',
            multiplier4x: '/assets/sounds/4-times.mp3',
            multiplier5x: '/assets/sounds/5-times.mp3',
            multiplier6x: '/assets/sounds/6-times.mp3',
            multiplier8x: '/assets/sounds/8-times.mp3',
            multiplier10x: '/assets/sounds/10-times.mp3',
            wild: '/assets/sounds/wow.mp3',
          
        };

        this.isMuted = false;
        this.musicVolume = 0.5;
        this.effectsVolume = 1.0;
        this.isInitialized = false;
        
        // Initialize all sounds
        this.initializeSounds();
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause all currently playing sounds
                Object.values(this.sounds).forEach(sound => {
                    if (!sound.paused) {
                        sound.pause();
                    }
                });
            } else {
                // Only resume background music when returning
                if (!this.isMuted && this.isInitialized) {
                    this.resumeBackgroundMusic();
                }
            }
        });

        // Add click listener for initialization
        document.addEventListener('click', () => {
            if (!this.isInitialized) {
                this.initializeAudioContext();
            }
        }, { once: true });
    }

    async initializeSounds() {
        try {
            if (document.readyState === 'loading') {
                await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
            }

            const loadPromises = Object.entries(this.soundPaths).map(([key, path]) => 
                this.loadSound(key, path)
                    .catch(error => {
                        console.error(`Failed to load sound ${key}:`, error);
                        return Promise.resolve(); // Continue loading other sounds
                    })
            );
            
            await Promise.all(loadPromises);
            console.log('All sounds initialized successfully');
        } catch (error) {
            console.error('Failed to initialize sounds:', error);
        }
    }

    initializeAudioContext() {
        // Initialize audio after user interaction
        this.isInitialized = true;

        // Play game open sound
        if (this.sounds.gameOpen && !this.isMuted) {
            this.playSound('gameOpen');
        }

        // Configure and start background music
        if (this.sounds.gamePlay3) {
            this.sounds.gamePlay3.loop = true;
            this.sounds.gamePlay3.volume = this.musicVolume;
            if (!this.isMuted) {
                this.sounds.gamePlay3.play().catch(error => {
                    console.error('Failed to start background music:', error);
                });
            }
        }
    }

    loadSound(key, path) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(path);
            
            audio.oncanplaythrough = () => {
                this.sounds[key] = audio;
                resolve();
            };
            
            audio.onerror = () => {
                console.error(`Failed to load sound: ${path}`);
                reject(new Error(`Failed to load sound: ${path}`));
            };

            // Start loading the audio
            audio.load();
        });
    }

    playSound(soundName) {
        if (!this.isInitialized) {
            console.warn('Audio not initialized yet - waiting for user interaction');
            return;
        }

        if (this.isMuted || !this.sounds[soundName]) {
            console.warn(`Cannot play sound: ${soundName} - Sound is either muted or not loaded`);
            return;
        }
        
        try {
            const sound = this.sounds[soundName];
            if (sound.playing) {
                sound.pause();
                sound.currentTime = 0;
            }
            
            sound.volume = soundName === 'gamePlay3' ? this.musicVolume : this.effectsVolume;
            
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error(`Error playing sound: ${soundName}`, error);
                });
            }
        } catch (error) {
            console.error(`Error with sound: ${soundName}`, error);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.pauseBackgroundMusic();
        } else {
            this.resumeBackgroundMusic();
        }
        return this.isMuted;
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.sounds.gamePlay3.volume = this.musicVolume;
    }

    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
    }

    pauseBackgroundMusic() {
        this.sounds.gamePlay3.pause();
    }

    resumeBackgroundMusic() {
        this.sounds.gamePlay3.play();
    }

    // Fix the formatting of playWinSound golden case
    playWinSound(symbolType, isGolden, multiplier = 1, winAmount = 0) {
        if (this.isMuted) return;

        const playQueue = [];

        if (multiplier > 1) {
            const multiplierSound = `multiplier${multiplier}x`;
            if (this.sounds[multiplierSound]) {
                playQueue.push({ sound: multiplierSound, delay: 0 });
            }
        }

        if (winAmount > 50) {
            playQueue.push({ sound: 'big_joker', delay: 300 });
            return this.playQueuedSounds(playQueue);
        }

        if (isGolden) {
            playQueue.push({ sound: 'gold', delay: 300 });
            return this.playQueuedSounds(playQueue);
        }

        const symbolSounds = {
            '7': 'seven',
            '8': 'eight',
            '9': 'nine',
            '10': 'ten',
            'jack': 'jack',
            'queen': 'queen',
            'king': 'king',
            'ace': 'ace',
            'joker': 'small_joker',
            'wild': 'wild',
            'big_joker': 'big_joker',
            'scatter': 'scatter',
            'spade': 'spade',
            'heart': 'heart',
            'gold': 'gold',
            'diamond': 'diamond',
            'club': 'club'
        };

        const sound = symbolSounds[symbolType.toLowerCase()];
        if (sound) {
            playQueue.push({ sound, delay: 300 });
        }

        this.playQueuedSounds(playQueue);
    }

    playQueuedSounds(queue) {
        queue.forEach(({ sound, delay }) => {
            setTimeout(() => this.playSound(sound), delay);
        });
    }
}

export const audioManager = new AudioManager();