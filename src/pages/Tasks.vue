<script setup>
import { ref, computed } from 'vue';
import { state, uid, DAYS } from '../store.js';

const d = state.data;
const LABELS = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];
const day = ref(new Date().getDay());
const txt = ref('');

const mine = computed(() => d.tasks.filter(t => t.day === day.value));
const sorted = computed(() => [...mine.value.filter(t => !t.done), ...mine.value.filter(t => t.done)]);
const remaining = computed(() => mine.value.filter(t => !t.done).length);
const hasPending = i => d.tasks.some(t => t.day === i && !t.done);

function add() {
  const title = txt.value.trim();
  if (!title) return;
  d.tasks.unshift({ id: uid(), title, day: day.value, done: false });
  txt.value = '';
}
const remove = id => { d.tasks = d.tasks.filter(t => t.id !== id) };
</script>

<template>
  <main>
    <h1>Tasks</h1>
    <p class="sub">{{ DAYS[day] }} · {{ remaining }} remaining</p>

    <div class="days">
      <button v-for="(l, i) in LABELS" :key="i" :aria-label="DAYS[i]" @click="day = i"
        :class="{ on: i === day, has: hasPending(i) }">{{ l }}</button>
    </div>

    <form class="form" @submit.prevent="add">
      <input v-model="txt" placeholder="New task" />
      <button :disabled="!txt.trim()">Add</button>
    </form>

    <div class="card">
      <div v-for="t in sorted" :key="t.id" class="row">
        <button class="chk" :class="{ on: t.done }" aria-label="Toggle done" @click="t.done = !t.done">
          {{ t.done ? '✓' : '' }}
        </button>
        <span class="g" :class="{ done: t.done }">{{ t.title }}</span>
        <button class="x" aria-label="Delete" @click="remove(t.id)">×</button>
      </div>
      <div v-if="!sorted.length" class="empty">No tasks for {{ DAYS[day] }}.</div>
    </div>
  </main>
</template>
