import { createRouter, createWebHistory } from 'vue-router';
import Booking from '../components/booking.vue';
import Scale from '../components/scale.vue';
import App from '../App.vue';

const routes = [
  {
    path: '/Booking',
    name: 'Booking',
    component: Booking,
  },
  {
    path: '/scale',
    name: 'Scale',
    component: Scale,
  },
  {
    path: '/',
    name: 'App',
    component: App,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;