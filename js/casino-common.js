/**
 * @file casino-common.js
 * @description Centralized library for CasinoRitmic: Audio, Rewards, and UI.
 */

window.Casino = (() => {
    // --- State & Constants ---
    const STATE = {
        audioCtx: null,
        bgMusic: null,
        volume: parseFloat(localStorage.getItem('casinoVolume') || '0.5'),
        isMuted: false,
    };

    const ASSETS = {
        figures: {
            rodona: { img: 'images/rodona.jpg', val: 4 },
            blanca: { img: 'images/blanca.jpg', val: 2 },
            negra: { img: 'images/negra.jpg', val: 1 },
            corxera: { img: 'images/corxera.jpg', val: 0.5 },
            semicorxera: { img: 'images/semicorxera.jpg', val: 0.25 }
        },
        silences: {
            rodona: 'images/silencirodona.jpg',
            blanca: 'images/silenciblanca.jpg',
            negra: 'images/silencinegra.jpg',
            corxera: 'images/silencicorxera.jpg',
            semicorxera: 'images/silencisemicorxera.jpg'
        }
    };

    // --- Audio Module ---
    const Audio = {
        init(bgMusicSrc) {
            if (!STATE.audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                STATE.audioCtx = new AudioContext();
            }
            
            if (bgMusicSrc) {
                STATE.bgMusic = new window.Audio(bgMusicSrc);
                STATE.bgMusic.loop = true;
                STATE.bgMusic.volume = STATE.volume * 0.5; // BG music usually quieter
                
                // Interaction to start audio (browser policy)
                document.addEventListener('click', () => {
                    if (STATE.bgMusic.paused) {
                        STATE.bgMusic.play().catch(e => console.warn("BG Music failed:", e));
                        if (STATE.audioCtx.state === 'suspended') STATE.audioCtx.resume();
                    }
                }, { once: true });
            }
        },

        playTone(freq = 440, type = 'sine', duration = 0.5, gainVal = 0.1) {
            if (!STATE.audioCtx || STATE.isMuted) return;
            if (STATE.audioCtx.state === 'suspended') STATE.audioCtx.resume();

            const osc = STATE.audioCtx.createOscillator();
            const gainNode = STATE.audioCtx.createGain();
            const now = STATE.audioCtx.currentTime;

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            
            gainNode.gain.setValueAtTime(STATE.volume * gainVal, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

            osc.connect(gainNode);
            gainNode.connect(STATE.audioCtx.destination);

            osc.start(now);
            osc.stop(now + duration);
        },

        playWin() {
            this.playTone(523.25, 'sine', 0.2); // C5
            setTimeout(() => this.playTone(659.25, 'sine', 0.2), 150); // E5
            setTimeout(() => this.playTone(783.99, 'sine', 0.4), 300); // G5
        },

        playLose() {
            this.playTone(150, 'sawtooth', 0.5, 0.2);
        },

        playClick() {
            this.playTone(800, 'triangle', 0.05, 0.05);
        },

        setVolume(val) {
            STATE.volume = parseFloat(val);
            localStorage.setItem('casinoVolume', val);
            if (STATE.bgMusic) STATE.bgMusic.volume = STATE.volume * 0.5;
        },

        toggleMute() {
            STATE.isMuted = !STATE.isMuted;
            if (STATE.bgMusic) STATE.bgMusic.muted = STATE.isMuted;
            return STATE.isMuted;
        }
    };

    // --- Rewards Module ---
    const Rewards = {
        saveProgress(gameKey, value = true) {
            const rewards = JSON.parse(sessionStorage.getItem('casinoRewards') || '{}');
            rewards[gameKey] = value;
            sessionStorage.setItem('casinoRewards', JSON.stringify(rewards));
            
            // Sync with some localStorage "Save Slots" if implemented
            this.syncWithSaves();
        },

        isUnlocked(gameKey) {
            const rewards = JSON.parse(sessionStorage.getItem('casinoRewards') || '{}');
            return !!rewards[gameKey];
        },

        syncWithSaves() {
            // Future logic for multiple save slots
        }
    };

    // --- UI Module ---
    const UI = {
        injectBasicUI(titleText) {
            // Inject Sidebar/Header with Menu and Volume
            const header = document.createElement('div');
            header.id = 'casino-ui-bar';
            header.innerHTML = `
                <a href="menu.html" class="btn-menu">🏠 MENÚ</a>
                <h1 style="color:var(--gold); margin:0;">${titleText.toUpperCase()}</h1>
                <div class="volume-control">
                    <span id="mute-icon" style="cursor:pointer; font-size:1.5rem;">🔊</span>
                    <input type="range" id="casino-volume-slider" min="0" max="1" step="0.1" value="${STATE.volume}">
                </div>
            `;
            document.body.prepend(header);

            // Events
            const slider = document.getElementById('casino-volume-slider');
            const muteIcon = document.getElementById('mute-icon');

            slider.addEventListener('input', (e) => {
                Audio.setVolume(e.target.value);
                this.updateMuteIcon();
            });

            muteIcon.addEventListener('click', () => {
                const muted = Audio.toggleMute();
                this.updateMuteIcon();
            });
            
            this.updateMuteIcon();
        },

        updateMuteIcon() {
            const icon = document.getElementById('mute-icon');
            if (!icon) return;
            if (STATE.isMuted || STATE.volume === 0) icon.textContent = '🔇';
            else if (STATE.volume < 0.5) icon.textContent = '🔉';
            else icon.textContent = '🔊';
        },

        showModal(id, title, content, bntText, callback) {
            let modal = document.getElementById(id);
            if (!modal) {
                modal = document.createElement('div');
                modal.id = id;
                modal.className = 'casino-modal';
                document.body.appendChild(modal);
            }
            
            modal.innerHTML = `
                <div class="modal-content">
                    <h2 style="color: var(--gold);">${title}</h2>
                    <div class="modal-body">${content}</div>
                    <button class="modal-btn">${bntText}</button>
                </div>
            `;
            
            modal.style.display = 'flex';
            modal.querySelector('.modal-btn').onclick = () => {
                modal.style.display = 'none';
                if (callback) callback();
            };
        },

        showVictory(relicHtml, callback) {
            this.showModal('win-modal', 'VICTÒRIA LLEGENDÀRIA!', 
                `<div class="relic-icon" style="font-size:4rem; margin:20px;">🎼</div>${relicHtml}`, 
                'TORNAR AL MENÚ', () => {
                    if (callback) callback();
                    else window.location.href = 'menu.html';
                });
            Audio.playWin();
        }
    };

    return {
        Audio,
        Rewards,
        UI,
        ASSETS,
        get state() { return STATE; }
    };
})();
