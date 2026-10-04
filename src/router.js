import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Tasks from './pages/Tasks.vue';
import Timer from './pages/Timer.vue';
import Notes from './pages/Notes.vue';
import Profile from './pages/Profile.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/tasks', component: Tasks },
    { path: '/timer', component: Timer },
    { path: '/notes', component: Notes },
    { path: '/profile', component: Profile },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});
