/**
 * @file casino-common.js
 * @description Centralized library for CasinoRitmic: Audio, Rewards, and UI.
 */

// PONT AULATECH · contracte v1, inline (les 26 taules que fan servir aquest
// motor no inclouen cap altre <script> comú, així que el pont viu aquí per
// no haver de tocar 26 HTML només per un <script src>).
if (!window.AulaTechBridge) {
    window.AulaTechBridge = (function (w) {
        const clamp01 = (v) => { v = Number(v); return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0; };
        const int = (v) => { v = Math.round(Number(v)); return Number.isFinite(v) && v > 0 ? v : 0; };
        const sent = new Set();
        return {
            t0: Date.now(),
            startClock() { this.t0 = Date.now(); sent.clear(); },
            send(gameId, f) {
                f = f || {};
                const data = {
                    p_juego_id: String(gameId || 'casino-ritmic'),
                    p_bloque: 'general', p_tema: null,
                    p_completado: !!f.completat, p_precision: clamp01(f.precisio),
                    p_errores: int(f.errors), p_racha_max: int(f.rachaMax),
                    p_tiempo_ms: int(f.tempsMs === undefined ? Date.now() - this.t0 : f.tempsMs),
                    p_perfecto: !!f.perfecte,
                };
                try { w.parent.postMessage({ source: 'aulatech', action: 'GAME_END', v: 1, data }, '*'); }
                catch (e) { /* standalone */ }
                return data;
            },
            sendOnce(gameId, f) {
                const k = String(gameId);
                if (sent.has(k)) return null;
                sent.add(k);
                return this.send(k, f);
            },
        };
    })(window);
}

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
            if (value) {
                // Prefix `casino-`: cada taula és un joc propi al manifest (1★) i
                // així no xoca amb ids d'altres jocs (derby, pesca… són també
                // parades de la Fira Musical).
                window.AulaTechBridge?.sendOnce('casino-' + String(gameKey).replace(/^reward_/, ''), { completat: true });
            }
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
            // La barra és la CAPÇALERA de la taula (dins de .casino-table, que és flex-column).
            // Abans es feia body.prepend → com que el <body> és flex-row, la barra competia
            // en amplada amb la taula (95vw) i quedava esclafada a l'esquerra.
            const table = document.querySelector('.casino-table');
            (table || document.body).prepend(header);

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
                    <button class="modal-btn modal-footer-btn">${bntText}</button>
                </div>
            `;

            modal.style.display = 'flex';
            // .modal-footer-btn: el contenido puede incluir sus propios .modal-btn — no secuestrarlos
            modal.querySelector('.modal-footer-btn').onclick = () => {
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

/* ── Sortida directa quan el joc s'obre en pestanya pròpia ───────────────────
   Dins de l'app el joc viu en un iframe i el pare (Viewer) recull el missatge.
   Però el Gimnàs obre els jocs amb target="_blank": allà `parent` és un mateix,
   el postMessage s'envia a si mateix i no arriba enlloc.
   Com que tot es serveix des del mateix origen, la sessió de l'alumne ja és al
   localStorage. Fem servir fetch contra l'API REST i NO el client del CDN:
   així no hi ha llibreria externa que carregui tard ni cursa amb la sessió.
   La clau és la publicable (ja viatja al bundle de l'app); qui protegeix les
   dades és l'RLS i que submit_game_result() decideix el pagament al servidor. */
(function () {
  if (window.parent !== window) return;   // dins de l'app: ja ho recull el pare
  if (window.__atDirecte) return;         // ja escoltat: mai dues vegades
  window.__atDirecte = true;
  var SB = 'https://dxpdciplsxjmtfhnbqao.supabase.co';
  var AK = 'sb_publishable_nOg_fx9ai3hbMOD4-ZI-Sg_V9i9VZhW';
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.source !== 'aulatech' || d.action !== 'GAME_END' || !d.data) return;
    var raw = localStorage.getItem('sb-dxpdciplsxjmtfhnbqao-auth-token');
    if (!raw) return;                     // ningú connectat: no hi ha res a reportar
    var tok; try { tok = JSON.parse(raw).access_token; } catch (_) { return; }
    if (!tok) return;
    fetch(SB + '/rest/v1/rpc/submit_game_result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: AK, Authorization: 'Bearer ' + tok },
      body: JSON.stringify(d.data),
    }).catch(function () { /* sense xarxa: es perd la partida, però el joc no es trenca */ });
  });
})();
