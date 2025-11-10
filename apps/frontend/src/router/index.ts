import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/views/DashboardView.vue"),
    },
    {
      path: "/playground",
      name: "playground",
      component: () => import("@/views/PlaygroundView.vue"),
    },
    {
      path: "/",
      name: "habits",
      component: () => import("@/views/HabitsView.vue"),
    },
    {
      path: "/analytics",
      name: "analytics",
      component: () => import("@/views/AnalyticsView.vue"),
    },
  ],
});

export default router;
