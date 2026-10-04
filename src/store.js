import { reactive, watch } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from './firebase.js';

// Local storage helper
export const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } };
export const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };
export const uid = () => Math.random().toString(36).slice(2, 9);
export const dkey = (d = new Date()) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
export const clock = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DEF = { name: 'Student', goal: 120, focus: 25, brk: 5, dark: false, tasks: [], notes: [], log: {} };

export function beep() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator();
    o.connect(c.destination); o.frequency.value = 880; o.start(); o.stop(c.currentTime + 0.4);
  } catch (e) {}
}

const initialDark = ld('sp_theme_dark', false);
document.documentElement.dataset.theme = initialDark ? 'dark' : 'light';

// Main reactive state
export const state = reactive({
  user: null,
  uid: null,
  email: null,
  loading: true,
  data: { ...DEF, dark: initialDark }
});

let unsubscribeDoc = null;
let isUpdatingFromRemote = false;

// Direct immediate save to Firestore
export async function saveToFirestore() {
  if (!state.uid || isUpdatingFromRemote) return;
  try {
    const userRef = doc(db, 'users', state.uid);
    const cleanData = JSON.parse(JSON.stringify(state.data));
    await setDoc(userRef, cleanData, { merge: true });
    sv('sp_data_' + state.uid, cleanData);
    console.log('[Firestore] Successfully saved user data');
  } catch (err) {
    console.error('[Firestore] Failed to save to database:', err);
  }
}

// Debounced auto-save on any mutation to state.data
let saveTimeout = null;
function queueSyncToFirestore() {
  if (!state.uid || isUpdatingFromRemote) return;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToFirestore();
  }, 300);
}

// Watch state.data mutations deeply
watch(
  () => state.data,
  () => {
    queueSyncToFirestore();
  },
  { deep: true }
);

// Watch dark mode toggle specifically
watch(
  () => state.data.dark,
  (dark) => {
    const isDark = Boolean(dark);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    sv('sp_theme_dark', isDark);
  },
  { immediate: true }
);

// Listen to Firebase Auth state
onAuthStateChanged(auth, async (firebaseUser) => {
  if (unsubscribeDoc) {
    unsubscribeDoc();
    unsubscribeDoc = null;
  }

  if (firebaseUser) {
    state.user = firebaseUser;
    state.uid = firebaseUser.uid;
    state.email = firebaseUser.email;

    // Fast-path: fill cached data from local storage while network loads
    const cached = ld('sp_data_' + firebaseUser.uid, null);
    if (cached) {
      isUpdatingFromRemote = true;
      Object.assign(state.data, { ...DEF, ...cached });
      isUpdatingFromRemote = false;
    }

    const userRef = doc(db, 'users', firebaseUser.uid);

    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        // Document doesn't exist yet, create initial document
        const initialData = {
          ...DEF,
          name: firebaseUser.displayName || 'Student',
          email: firebaseUser.email,
          dark: state.data.dark || false,
          tasks: [],
          notes: [],
          log: {}
        };
        await setDoc(userRef, initialData);
        isUpdatingFromRemote = true;
        Object.assign(state.data, initialData);
        isUpdatingFromRemote = false;
        sv('sp_data_' + firebaseUser.uid, initialData);
      } else {
        // Document exists: apply remote data into reactive state.data
        const remote = snap.data();
        isUpdatingFromRemote = true;
        Object.assign(state.data, { ...DEF, ...remote });
        isUpdatingFromRemote = false;
        sv('sp_data_' + firebaseUser.uid, state.data);
      }
    } catch (e) {
      console.error('[Firestore] Error fetching initial document:', e);
    }

    // Subscribe to realtime updates from Firestore
    unsubscribeDoc = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remote = docSnap.data();
          isUpdatingFromRemote = true;
          Object.assign(state.data, { ...DEF, ...remote });
          isUpdatingFromRemote = false;
          sv('sp_data_' + firebaseUser.uid, state.data);
        }
      },
      (error) => {
        console.error('[Firestore] Snapshot listener error:', error);
      }
    );
  } else {
    state.user = null;
    state.uid = null;
    state.email = null;
    isUpdatingFromRemote = true;
    Object.assign(state.data, { ...DEF, dark: ld('sp_theme_dark', false) });
    isUpdatingFromRemote = false;
  }

  state.loading = false;
});

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signupWithEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch (e) {}
  }
  const userRef = doc(db, 'users', cred.user.uid);
  const initialData = {
    ...DEF,
    name: displayName || 'Student',
    email: cred.user.email,
    dark: state.data.dark || false,
    tasks: [],
    notes: [],
    log: {}
  };
  await setDoc(userRef, initialData);
  isUpdatingFromRemote = true;
  Object.assign(state.data, initialData);
  isUpdatingFromRemote = false;
  sv('sp_data_' + cred.user.uid, initialData);
  return cred.user;
}

export async function logout() {
  if (unsubscribeDoc) {
    unsubscribeDoc();
    unsubscribeDoc = null;
  }
  await signOut(auth);
}
