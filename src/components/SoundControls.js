import React from 'react';
import { audioManager } from '../utils/audioManager';

const SoundControls = () => {
    const [isMuted, setIsMuted] = React.useState(false);
    
    const handleMuteToggle = () => {
        const muted = audioManager.toggleMute();
        setIsMuted(muted);
    };

    const handleMusicVolume = (e) => {
        audioManager.setMusicVolume(parseFloat(e.target.value));
    };

    const handleEffectsVolume = (e) => {
        audioManager.setEffectsVolume(parseFloat(e.target.value));
    };

    return (
        <div className="sound-controls">
            <button onClick={handleMuteToggle}>
                {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <div className="volume-control">
                <label>Music Volume</label>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    defaultValue="0.5"
                    onChange={handleMusicVolume}
                />
            </div>
            <div className="volume-control">
                <label>Effects Volume</label>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    defaultValue="1"
                    onChange={handleEffectsVolume}
                />
            </div>
        </div>
    );
};

export default SoundControls;