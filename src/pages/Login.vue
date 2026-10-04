<script setup>
import { ref, reactive } from 'vue';
import { loginWithEmail, signupWithEmail } from '../store.js';

const signup = ref(false);
const f = reactive({ name: '', email: '', pw: '' });
const err = ref('');
const loading = ref(false);

function friendlyErrorMessage(e) {
  const code = e?.code || '';
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Incorrect email or password.';
  }
  if (code === 'auth/email-already-in-use') return 'That email already has an account. Log in instead.';
  if (code === 'auth/weak-password') return 'Password should be at least 6 characters.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
  if (code === 'auth/network-request-failed') return 'Network error. Please check your connection.';
  return e.message || 'An error occurred during authentication.';
}

async function submit() {
  err.value = '';
  const em = f.email.trim();
  if (f.pw.length < 6) {
    err.value = 'Password must be at least 6 characters.';
    return;
  }

  loading.value = true;
  try {
    if (signup.value) {
      await signupWithEmail(em, f.pw, f.name.trim() || 'Student');
    } else {
      await loginWithEmail(em, f.pw);
    }
  } catch (e) {
    console.error('Auth error:', e);
    err.value = friendlyErrorMessage(e);
  } finally {
    loading.value = false;
  }
}

function switchMode() {
  signup.value = !signup.value;
  err.value = '';
}
</script>

<template>
  <main class="auth">
    <h1>Study Planner</h1>
    <p class="sub">{{ signup ? 'Create your account.' : 'Log in to continue.' }}</p>
    <form class="card" @submit.prevent="submit">
      <input v-if="signup" v-model="f.name" placeholder="Name" autocomplete="name" />
      <input v-model="f.email" type="email" placeholder="Email" autocomplete="email" required />
      <input
        v-model="f.pw"
        type="password"
        placeholder="Password (6+ characters)"
        required
        :autocomplete="signup ? 'new-password' : 'current-password'"
      />
      <div v-if="err" class="err" role="alert">{{ err }}</div>
      <button style="width: 100%" :disabled="loading">
        {{ loading ? 'Please wait...' : (signup ? 'Sign up' : 'Log in') }}
      </button>
    </form>
    <p style="text-align: center">
      <button type="button" class="alt" :disabled="loading" @click="switchMode">
        {{ signup ? 'I already have an account' : 'Create an account' }}
      </button>
    </p>
  </main>
</template>
