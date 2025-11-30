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
      name: "habitsView",
      component: () => import("@/views/HabitsView.vue"),
    },
    {
      path: "/analytics",
      name: "analytics",
      component: () => import("@/views/AnalyticsView.vue"),
    },
    {
      path: "/habitsTable",
      name: "habitsTable",
      component: () => import("@/views/HabitsTableView.vue"),
    },
    {
      path: "/themePlay",
      name: "themePlay",
      component: () => import("@/views/ThemePlayView.vue"),
    },
  ],
});

export default router;
