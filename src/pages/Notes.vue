<script setup>
import { ref, computed } from 'vue';
import { state, uid } from '../store.js';

const d = state.data;
const sel = ref(null);
const q = ref('');

const cur = computed(() => d.notes.find(n => n.id === sel.value));
const list = computed(() =>
  [...d.notes].sort((a, b) => b.date - a.date).filter(n => n.text.toLowerCase().includes(q.value.toLowerCase())));

const title = n => n.text.split('\n')[0] || 'New note';
const preview = n => (n.text.split('\n')[1] || '').slice(0, 50);

// Drop the open note if it was left empty.
function close() {
  d.notes = d.notes.filter(n => n.text.trim() || n.id !== sel.value);
  sel.value = null;
}
function create() {
  if (sel.value) close();
  const n = { id: uid(), text: '', date: Date.now() };
  d.notes.unshift(n);
  sel.value = n.id;
}
function edit(e) { cur.value.text = e.target.value; cur.value.date = Date.now() }
function remove() { d.notes = d.notes.filter(n => n.id !== sel.value); sel.value = null }
function open(id) { if (sel.value && sel.value !== id) close(); sel.value = id }
</script>

<template>
  <main>
    <h1>Notes</h1>
    <div class="form">
      <input v-model="q" type="search" placeholder="Search" />
      <button @click="create">New</button>
    </div>

    <div v-if="cur" class="card">
      <textarea autofocus placeholder="First line is the title" :value="cur.text" @input="edit"></textarea>
      <div class="form">
        <button @click="close">Done</button>
        <button class="red" @click="remove">Delete</button>
      </div>
    </div>

    <div class="card">
      <div v-for="n in list" :key="n.id" class="row" style="cursor: pointer" @click="open(n.id)">
        <div class="g">
          <b>{{ title(n) }}</b>
          <div class="sub" style="margin: 0">{{ new Date(n.date).toLocaleDateString() }} {{ preview(n) }}</div>
        </div>
      </div>
      <div v-if="!list.length" class="empty">No notes yet.</div>
    </div>
  </main>
</template>
