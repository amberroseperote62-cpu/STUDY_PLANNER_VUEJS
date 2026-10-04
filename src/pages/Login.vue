<script setup>
import { ref, reactive } from 'vue';
import { ld, sv, hash, DEF, login } from '../store.js';

const signup = ref(false);
const f = reactive({ name: '', email: '', pw: '' });
const err = ref('');

async function submit() {
  err.value = '';
  const em = f.email.trim().toLowerCase();
  if (f.pw.length < 6) return (err.value = 'Password must be at least 6 characters.');
  const users = ld('sp_users', {}), h = await hash(f.pw);
  if (signup.value) {
    if (users[em]) return (err.value = 'That email already has an account. Log in instead.');
    users[em] = { h }; sv('sp_users', users);
    sv('sp_data_' + em, { ...DEF, name: f.name.trim() || 'Student' });
  } else if (!users[em] || users[em].h !== h) {
    return (err.value = 'Email or password is incorrect.');
  }
  login(em);
}
function switchMode() { signup.value = !signup.value; err.value = '' }
</script>

<template>
  <main class="auth">
    <h1>Study Planner</h1>
    <p class="sub">{{ signup ? 'Create your account.' : 'Log in to continue.' }}</p>
    <form class="card" @submit.prevent="submit">
      <input v-if="signup" v-model="f.name" placeholder="Name" autocomplete="name" />
      <input v-model="f.email" type="email" placeholder="Email" autocomplete="email" required />
      <input v-model="f.pw" type="password" placeholder="Password (6+ characters)" required
        :autocomplete="signup ? 'new-password' : 'current-password'" />
      <div v-if="err" class="err" role="alert">{{ err }}</div>
      <button style="width: 100%">{{ signup ? 'Sign up' : 'Log in' }}</button>
    </form>
    <p style="text-align: center">
      <button type="button" class="alt" @click="switchMode">
        {{ signup ? 'I already have an account' : 'Create an account' }}
      </button>
    </p>
  </main>
</template>
