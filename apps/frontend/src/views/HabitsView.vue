<template>
  <div class="habits-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ t("hero.title") }}</h1>
        <p class="hero-subtitle">{{ t("hero.subtitle") }}</p>
        <BaseButton
          :label="t('hero.cta')"
          class="btn-gradient"
          @click="openAddModal"
        />
      </div>
      <div class="hero-image">
        <div class="placeholder-image">
          <AppLogo :size="'xl'" :showText="false" />
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="stats-grid">
        <StatsCard
          :title="t('stats.activeHabits')"
          :value="habits.length"
          icon-src="/src/assets/emojis/Active Habits Emoji.svg"
          variant="primary"
        />
        <StatsCard
          :title="t('stats.completedThisMonth')"
          :value="totalCompleted"
          icon-src="/src/assets/emojis/Emoji Completed Month.svg"
          variant="success"
        />
        <StatsCard
          :title="t('stats.bestStreak')"
          :value="bestStreak"
          :unit="t('streakDisplay.days.other')"
          icon-src="/src/assets/emojis/Best Streak Emoji.svg"
          variant="warning"
        />
        <StatsCard
          :title="t('stats.completionRate')"
          :value="completionPercentage"
          unit="%"
          icon-src="/src/assets/emojis/Emoji Completion Rate.svg"
          variant="primary"
        />
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-section">
      <div class="section-header">
        <h2>{{ t("habits.title") }}</h2>
        <BaseButton
          :label="t('habits.addNew')"
          variant="primary"
          @click="openAddModal"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t("habits.loading") }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state card">
        <p>❌ {{ error }}</p>
        <BaseButton :label="t('habits.tryAgain')" @click="handleReloadHabits" />
      </div>

      <!-- Empty State -->
      <div v-else-if="habits.length === 0" class="empty-state card">
        <div class="empty-icon">🌱</div>
        <h3>{{ t("habits.noHabits") }}</h3>
        <p>{{ t("habits.noHabitsDescription") }}</p>
        <BaseButton
          :label="t('habits.createFirst')"
          variant="primary"
          @click="openAddModal"
        />
      </div>

      <!-- Habits List -->
      <div v-else class="habits-list">
        <HabitCard
          v-for="habit in habits"
          :key="habit.id"
          :habit="habit"
          :completion-today="isCompletedToday(habit.id)"
          :current-streak="getStreak(habit.id)"
          :best-streak="getBestStreak(habit.id)"
          :completion-count="getCompletionCount(habit.id)"
          :logs="getHabitLogs(habit.id)"
          @edit="openEditModal"
          @delete="onDelete"
          @mark-date="onMarkDate"
        />
      </div>
    </section>

    <!-- Features Section (SEO) -->
    <section class="features-section">
      <h2>{{ t("features.title") }}</h2>
      <div class="features-grid">
        <div class="feature-card card">
          <div class="feature-icon">📈</div>
          <h3>{{ t("features.seeProgress.title") }}</h3>
          <p>{{ t("features.seeProgress.description") }}</p>
        </div>
        <div class="feature-card card">
          <div class="feature-icon">🎯</div>
          <h3>{{ t("features.achieveGoals.title") }}</h3>
          <p>{{ t("features.achieveGoals.description") }}</p>
        </div>
        <div class="feature-card card">
          <div class="feature-icon">💪</div>
          <h3>{{ t("features.buildDiscipline.title") }}</h3>
          <p>{{ t("features.buildDiscipline.description") }}</p>
        </div>
        <div class="feature-card card">
          <div class="feature-icon">📊</div>
          <h3>{{ t("features.analyzeStats.title") }}</h3>
          <p>{{ t("features.analyzeStats.description") }}</p>
        </div>
      </div>
    </section>

    <!-- FAQ Section (SEO) -->
    <section class="faq-section">
      <h2>{{ t("faq.title") }}</h2>
      <div class="faq-list">
        <div class="faq-item card">
          <h4>{{ t("faq.q1Title") }}</h4>
          <p>{{ t("faq.q1Answer") }}</p>
        </div>
        <div class="faq-item card">
          <h4>{{ t("faq.q2Title") }}</h4>
          <p>{{ t("faq.q2Answer") }}</p>
        </div>
        <div class="faq-item card">
          <h4>{{ t("faq.q3Title") }}</h4>
          <p>{{ t("faq.q3Answer") }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section card-gradient">
      <h2>{{ t("cta.title") }}</h2>
      <p>{{ t("cta.subtitle") }}</p>
      <BaseButton
        :label="t('cta.button')"
        class="btn-gradient"
        @click="openAddModal"
      />
    </section>

    <!-- Modals -->
    <BaseModal
      :title="t('modals.addHabit')"
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
    >
      <HabitForm @success="onAddHabit" @cancel="isAddModalOpen = false" />
    </BaseModal>

    <BaseModal
      :title="t('modals.editHabit')"
      :is-open="isEditModalOpen"
      @close="isEditModalOpen = false"
    >
      <HabitForm
        :initial-habit="selectedHabit"
        @success="onUpdateHabit"
        @cancel="isEditModalOpen = false"
      />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useHabits } from "@/composables/useHabits";
import { useI18n } from "vue-i18n";
import type {
  Habit,
  HabitLog,
} from "../../../../packages/shared-types/habit.ts";
import { habitStorageService as habitStorage } from "@/services/habitStorage";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import HabitCard from "@/components/habits/HabitCard.vue";
import HabitForm from "@/components/habits/HabitForm.vue";
import StatsCard from "@/components/analytics/StatsCard.vue";
import AppHeader from "@/components/common/AppHeader.vue";
import AppLogo from "@/components/common/AppLogo.vue";

// Composable для работы с привычками
const {
  habits,
  loading,
  error,
  addHabit,
  updateHabit,
  deleteHabit,
  markHabitDate,
  isCompletedOn,
  reloadHabits,
} = useHabits();

const { t } = useI18n();

// Состояние модальных окон
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedHabit = ref<Habit | null>(null);

// ========== COMPUTED PROPERTIES ==========

// Вычисляем статистику
const totalCompleted = computed(() => {
  const logs = habitStorage.getLogs();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return logs.filter((log) => {
    const logDate = new Date(log.date);
    return (
      log.completed &&
      logDate.getMonth() === currentMonth &&
      logDate.getFullYear() === currentYear
    );
  }).length;
});

const bestStreak = computed(() => {
  let maxStreak = 0;

  habits.value.forEach((habit) => {
    const logs = habitStorage.getHabitLogs(habit.id);
    let currentStreak = 0;

    const sortedLogs = logs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    sortedLogs.forEach((log, index) => {
      if (log.completed) {
        currentStreak++;
      } else if (currentStreak > 0) {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 0;
      }
    });

    maxStreak = Math.max(maxStreak, currentStreak);
  });

  return maxStreak;
});

const completionPercentage = computed(() => {
  if (habits.value.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  const completed = habits.value.filter((habit) =>
    isCompletedToday(habit.id),
  ).length;

  return Math.round((completed / habits.value.length) * 100);
});

// ========== МЕТОДЫ ==========

const isCompletedToday = (habitId: string): boolean => {
  const logs = habitStorage.getHabitLogs(habitId);
  const today = new Date().toISOString().split("T")[0];
  return logs.some((log) => log.date === today && log.completed);
};

const getHabitLogs = (habitId: string): HabitLog[] => {
  return habitStorage.getHabitLogs(habitId);
};

const getStreak = (habitId: string): number => {
  const logs = habitStorage.getHabitLogs(habitId);
  let streak = 0;

  const sortedLogs = logs
    .filter((log) => log.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  sortedLogs.forEach((log) => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor(
      (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dayDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  });

  return streak;
};

const getBestStreak = (habitId: string): number => {
  const logs = habitStorage.getHabitLogs(habitId);
  let maxStreak = 0;
  let currentStreak = 0;

  const sortedLogs = logs
    .filter((log) => log.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedLogs.forEach((log, index) => {
    if (index === 0) {
      currentStreak = 1;
    } else {
      const prevLog = sortedLogs[index - 1];
      if (prevLog && prevLog.date) {
        const prevDate = new Date(prevLog.date);
        const currDate = new Date(log.date);
        const dayDiff = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
  });

  maxStreak = Math.max(maxStreak, currentStreak);
  return maxStreak;
};

const getCompletionCount = (habitId: string): number => {
  const logs = habitStorage.getHabitLogs(habitId);
  return logs.filter((log) => log.completed).length;
};

const openAddModal = () => {
  selectedHabit.value = null;
  isAddModalOpen.value = true;
};

const openEditModal = (habit: Habit) => {
  selectedHabit.value = habit;
  isEditModalOpen.value = true;
};

const onAddHabit = (habitData: Habit) => {
  addHabit(habitData);
  isAddModalOpen.value = false;
};

const onUpdateHabit = (habitData: Habit) => {
  updateHabit(habitData);
  isEditModalOpen.value = false;
  selectedHabit.value = null;
};

const onDelete = (habitId: string) => {
  if (confirm("Вы уверены, что хотите удалить эту привычку?")) {
    deleteHabit(habitId);
  }
};

const onMarkDate = (habitId: string, date: string, completed: boolean) => {
  markHabitDate(habitId, date, completed);
  reloadHabits();
};

const handleReloadHabits = () => {
  reloadHabits();
};
</script>

<style scoped>
/* ========== CONTAINER ========== */
.habits-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ========== HERO SECTION ========== */

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  margin-bottom: 80px;
  padding: 64px 32px;
  background: var(--gradient-bg);
  border-radius: var(--radius-xl);
}

.hero-content h1 {
  font-size: 48px;
  margin-bottom: 24px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
  line-height: 1.8;
}

.hero-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: linear-gradient(
    135deg,
    var(--color-bg-secondary),
    var(--color-bg-card)
  );
  border-radius: var(--radius-xl);
  font-size: 120px;
}

/* ========== STATS SECTION ========== */

.stats-section {
  margin-bottom: 80px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  text-align: center;
  padding: 32px 24px;
}

.stat-number {
  font-size: 42px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* ========== MAIN SECTION ========== */

.main-section {
  margin-bottom: 80px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0; /* ← Убираем padding отсюда, используем контейнер */
}

.section-header h2 {
  font-size: 32px;
  margin: 0;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ========== STATES ========== */

.loading-state,
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
  gap: 16px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3,
.error-state h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== FEATURES SECTION ========== */

.features-section {
  margin-bottom: 80px;
  padding: 64px 32px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
}

.features-section h2 {
  text-align: center;
  margin-bottom: 48px;
  font-size: 36px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* ========== FAQ SECTION ========== */

.faq-section {
  margin-bottom: 80px;
}

.faq-section h2 {
  text-align: center;
  margin-bottom: 48px;
  font-size: 36px;
}

.faq-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.faq-item {
  padding: 24px;
}

.faq-item h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: var(--color-primary);
}

.faq-item p {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

/* ========== CTA SECTION ========== */

.cta-section {
  padding: 64px 32px;
  text-align: center;
  background: var(--gradient-primary) !important;
  color: var(--color-text-white);
  margin-bottom: 40px;
  border-radius: var(--radius-xl);
}

.cta-section:hover {
  /* Перекрываем любые возможные hover-эффекты */
  transform: none !important;
  transition: none !important;
  cursor: default; /* или auto, если не нужно менять курсор */
}

.cta-section h2 {
  color: var(--color-text-white);
  font-size: 36px;
  margin-bottom: 16px;
}

.cta-section p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* ========== АДАПТИВНОСТЬ ========== */

@media (max-width: 1024px) {
  .habits-view {
    padding: 0 24px;
  }

  .hero-section {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 48px 24px;
  }

  .hero-image {
    height: 300px;
    font-size: 80px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .habits-view {
    padding: 0 16px;
  }

  .hero-section {
    padding: 32px 16px;
  }

  .hero-content h1 {
    font-size: 32px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .features-section {
    padding: 48px 16px;
  }

  .features-grid,
  .faq-list {
    grid-template-columns: 1fr;
  }

  .cta-section {
    padding: 48px 16px;
  }

  .cta-section h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .habits-view {
    padding: 0 12px;
  }

  .section-header h2 {
    font-size: 24px;
  }
}
</style>
