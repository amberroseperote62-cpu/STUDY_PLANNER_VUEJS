<script setup>
import { computed } from 'vue';
import { state } from './store.js';
import Login from './pages/Login.vue';

const tabs = [
  { to: '/',        label: 'Home' },
  { to: '/tasks',   label: 'Tasks' },
  { to: '/timer',   label: 'Timer' },
  { to: '/notes',   label: 'Notes' },
  { to: '/profile', label: 'Profile' },
];

const initials = computed(() => {
  const n = state.data?.name || '';
  return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
});
</script>

<template>
  <Login v-if="!state.email || !state.data" />
  <div v-else class="layout">
    <nav class="side">
      <div class="side-brand">
        <h2>Study<br>Planner</h2>
      </div>

      <RouterLink
        v-for="t in tabs"
        :key="t.to"
        :to="t.to"
        exact-active-class="active"
      >
        {{ t.label }}
      </RouterLink>

      <div class="who">
        <div class="avatar">{{ initials }}</div>
        <span class="who-name">{{ state.data.name }}</span>
      </div>
    </nav>

    <div class="content">
      <RouterView />
    </div>
  </div>
</template>
