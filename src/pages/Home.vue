<script setup>
import { computed } from 'vue';
import { state, dkey, DAYS } from '../store.js';

const d = state.data;
const now = new Date(), h = now.getHours(), day = now.getDay();
const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
const date = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

const mine = computed(() => d.tasks.filter(t => t.day === day));
const pending = computed(() => mine.value.filter(t => !t.done));
const streak = computed(() => {
  let n = 0;
  const c = new Date();
  if (!(d.log[dkey(c)]?.min > 0)) c.setDate(c.getDate() - 1);
  while (d.log[dkey(c)]?.min > 0) { n++; c.setDate(c.getDate() - 1) }
  return n;
});
</script>

<template>
  <main>
    <h1>{{ greeting }}, {{ d.name }}</h1>
    <p class="sub">{{ DAYS[day] }}, {{ date }}</p>

    <div class="stats">
      <div class="card"><b>{{ d.log[dkey()]?.min || 0 }} / {{ d.goal }}</b><span class="sub">Focus min</span></div>
      <div class="card"><b>{{ mine.length - pending.length }} / {{ mine.length }}</b><span class="sub">Tasks done</span></div>
      <div class="card"><b>{{ streak }}</b><span class="sub">Day streak</span></div>
    </div>

    <div class="form">
      <RouterLink class="btn" style="flex: 1" to="/tasks">Add task</RouterLink>
      <RouterLink class="btn alt" style="flex: 1" to="/timer">Start timer</RouterLink>
    </div>

    <div class="card">
      <b>Up next today</b>
      <div v-for="t in pending.slice(0, 3)" :key="t.id" class="row">{{ t.title }}</div>
      <div v-if="!pending.length" class="empty">Nothing left for today.</div>
    </div>
  </main>
</template>
