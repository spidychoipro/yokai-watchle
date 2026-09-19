'use strict';

import { state } from './store.js';
import { $ } from './dom.js';

let AC = null;
export function initAudio() {
  if (!AC) {
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
  }
  if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) {} }
}
function tone(freq, dur, type, gain, delay) {
  if (!AC) return;
  const t = AC.currentTime + (delay || 0);
  const o = AC.createOscillator();
  const g = AC.createGain();
  o.type = type || 'triangle';
  o.frequency.value = freq;
  const peak = gain || 0.1;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(AC.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
const SFX = {
  click() { tone(660, 0.07, 'square', 0.04); },
  wrong() { tone(190, 0.16, 'sawtooth', 0.07); tone(150, 0.2, 'sawtooth', 0.06, 0.05); },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.1, i * 0.12));
    tone(1318, 0.45, 'triangle', 0.09, 0.5);
  }
};
export function play(name) {
  if (!state.settings.sound) return;
  initAudio();
  if (AC && SFX[name]) SFX[name]();
}

let confRaf = null;
export function spawnConfetti() {
  const cv = $('confetti');
  const dpr = window.devicePixelRatio || 1;
  cv.width = Math.ceil(window.innerWidth * dpr);
  cv.height = Math.ceil(window.innerHeight * dpr);
  cv.style.width = window.innerWidth + 'px';
  cv.style.height = window.innerHeight + 'px';
  cv.classList.add('show');
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const colors = ['#ffc857', '#ffb347', '#a78bfa', '#6fdcb0', '#c9b458', '#b48cff', '#ffffff'];
  const parts = [];
  for (let i = 0; i < 90; i++) {
    parts.push({
      x: Math.random() * cv.width,
      y: -10 - Math.random() * cv.height * 0.35,
      w: (6 + Math.random() * 6) * dpr,
      h: (9 + Math.random() * 9) * dpr,
      vx: (Math.random() - 0.5) * 2.4 * dpr,
      vy: (2.2 + Math.random() * 3.6) * dpr,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
      circle: Math.random() < 0.4
    });
  }
  if (confRaf) cancelAnimationFrame(confRaf);
  confRaf = null;
  function step() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    let alive = 0;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.05 * dpr; p.rot += p.vr;
      if (p.y - p.h < cv.height) {
        alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - (p.y - cv.height * 0.8) / (cv.height * 0.35));
        if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
        ctx.restore();
      }
    }
    if (alive > 0) confRaf = requestAnimationFrame(step);
    else { cv.classList.remove('show'); ctx.clearRect(0, 0, cv.width, cv.height); confRaf = null; }
  }
  confRaf = requestAnimationFrame(step);
}
export function stopConfetti() {
  if (confRaf) { cancelAnimationFrame(confRaf); confRaf = null; }
  const cv = $('confetti');
  if (cv) { cv.classList.remove('show'); const c = cv.getContext('2d'); if (c) c.clearRect(0, 0, cv.width, cv.height); }
}