import { reactive, watch } from 'vue';

// Accounts and data live in this browser's localStorage.
export const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } };
export const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };
export const uid = () => Math.random().toString(36).slice(2, 9);
export const dkey = (d = new Date()) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
export const clock = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DEF = { name: 'Student', goal: 120, focus: 25, brk: 5, dark: false, tasks: [], notes: [], log: {} };

export async function hash(s) {
  try {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch (e) { return btoa(s) }
}

export function beep() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator();
    o.connect(c.destination); o.frequency.value = 880; o.start(); o.stop(c.currentTime + 0.4);
  } catch (e) {}
}

const load = em => ({ ...DEF, ...ld('sp_data_' + em, {}) });

// state.data is the signed-in user's data. Change it directly and it saves itself.
export const state = reactive({ email: ld('sp_session', null), data: null });
if (state.email) state.data = load(state.email);

watch(() => state.data, v => { if (state.email && v) sv('sp_data_' + state.email, v) }, { deep: true });
watch(() => state.data?.dark, dark => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, { immediate: true });

export function login(em) {
  sv('sp_session', em);
  state.data = load(em);
  state.email = em;
}
export function logout() {
  localStorage.removeItem('sp_session');
  state.email = null;
  state.data = null;
}
