import { createRouter, createWebHistory } from 'vue-router';
import Booking from '../components/booking.vue';
import Scale from '../components/scale.vue';

const routes = [
  {
    path: '/',
    name: 'Booking',
    component: Booking,
  },
  {
    path: '/scale',
    name: 'Scale',
    component: Scale,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;