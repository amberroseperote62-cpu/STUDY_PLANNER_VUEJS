<script setup>
import { ref } from 'vue';
import { state, logout } from '../store.js';

const d = state.data;
const name = ref(d.name);

const label = m => (m < 60 ? m + ' min' : Math.floor(m / 60) + ' hr' + (m % 60 ? ' ' + (m % 60) + ' min' : ''));
const range = (a, b, s) => { const r = []; for (let m = a; m <= b; m += s) r.push(m); return r };
const fields = [
  { key: 'goal', title: 'Daily goal', opts: range(15, 480, 15) },
  { key: 'focus', title: 'Focus session', opts: range(5, 120, 5) },
  { key: 'brk', title: 'Break', opts: range(1, 30, 1) },
];

const saveName = () => {
  state.data.name = state.data.name.trim() || 'Student';
};function clear() {
  if (confirm('Delete all your tasks, notes and history?')) { d.tasks = []; d.notes = []; d.log = {} }
}
</script>

<template>
  <main>
    <h1>Profile</h1>
    <p class="sub">{{ state.email }}</p>
    <div class="card">
      <label class="sub">Name</label>
      <input v-model="state.data.name" maxlength="30" @blur="saveName" />
      <div v-for="f in fields" :key="f.key" class="row">
        <span class="g">{{ f.title }}</span>
        <select v-model.number="d[f.key]">
          <option v-for="m in f.opts" :key="m" :value="m">{{ label(m) }}</option>
        </select>
      </div>
      <div class="row">
        <span class="g">Dark mode</span>
        <button
          type="button"
          class="switch"
          :class="{ on: d.dark }"
          role="switch"
          :aria-checked="d.dark"
          @click="d.dark = !d.dark"
        >
          <span class="switch-handle"></span>
        </button>
      </div>
    </div>
    <div class="form">
      <button class="alt" @click="logout">Log out</button>
      <button class="red" @click="clear">Clear my data</button>
    </div>
  </main>
</template>
