<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { state, ld, sv, dkey, clock, beep } from '../store.js';

const d = state.data;
// Timer state is saved so it keeps running while you visit other pages.
const t = ref(ld('sp_timer', { mode: 'focus', endAt: null, left: null }));
const now = ref(Date.now());
let tick;

const total = computed(() => (t.value.mode === 'focus' ? d.focus : d.brk) * 60);
const left = computed(() =>
  t.value.endAt ? Math.max(0, Math.round((t.value.endAt - now.value) / 1000)) : (t.value.left ?? total.value));

const update = next => { t.value = next; sv('sp_timer', next) };

onMounted(() => { tick = setInterval(() => { now.value = Date.now() }, 250) });
onUnmounted(() => { clearInterval(tick); document.title = 'Study Planner' });

// Finished: log the session (focus only) and switch mode.
watch(left, l => {
  if (!(t.value.endAt && l === 0)) return;
  if (t.value.mode === 'focus') {
    const k = dkey(), e = d.log[k] || { min: 0, ses: 0 };
    d.log[k] = { min: e.min + d.focus, ses: e.ses + 1 };
  }
  beep();
  update({ mode: t.value.mode === 'focus' ? 'break' : 'focus', endAt: null, left: null });
}, { immediate: true });

watch([left, () => t.value.endAt], () => {
  document.title = t.value.endAt ? clock(left.value) + ' – Study Planner' : 'Study Planner';
});

function toggle() {
  now.value = Date.now();
  update(t.value.endAt
    ? { ...t.value, endAt: null, left: left.value }
    : { ...t.value, endAt: Date.now() + left.value * 1000, left: null });
}
const reset = () => update({ ...t.value, endAt: null, left: null });
const swap = () => update({ mode: t.value.mode === 'focus' ? 'break' : 'focus', endAt: null, left: null });
</script>

<template>
  <main>
    <h1>Timer</h1>
    <p class="sub">{{ t.mode === 'focus' ? `Focus · ${d.focus} min` : `Break · ${d.brk} min` }}</p>
    <div class="big">{{ clock(left) }}</div>
    <div class="btns">
      <button @click="toggle">{{ t.endAt ? 'Pause' : left < total ? 'Resume' : 'Start' }}</button>
      <button class="alt" @click="reset">Reset</button>
      <button class="alt" @click="swap">Switch</button>
    </div>
    <p class="sub" style="text-align: center; margin-top: 20px">
      Finished focus sessions count toward your daily goal.
    </p>
  </main>
</template>
