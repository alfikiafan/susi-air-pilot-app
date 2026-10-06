<script setup lang="ts">
import { Check, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { formatMonthYear, type YearMonth, yearMonthOf } from '~/utils/date';

useHead({ title: 'Schedule · Susi Air Pilot' });

const route = useRoute();
const router = useRouter();
const schedule = useScheduleStore();
const pilot = usePilotStore();

/** A month in the URL (?year=2026&month=05) wins, so reloads and back-navigation keep the month. */
function monthFromQuery(): YearMonth | null {
  const year = Number(route.query.year);
  const month = Number(route.query.month);
  const valid =
    Number.isInteger(year) &&
    year >= 2000 &&
    year <= 2100 &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12;
  return valid ? { year, month } : null;
}

function initialMonth(): YearMonth | null {
  return (
    monthFromQuery() ??
    schedule.current ??
    (pilot.today ? yearMonthOf(pilot.today) : null)
  );
}

onMounted(() => {
  const target = initialMonth();
  if (target) {
    schedule.load(target);
    return;
  }
  // Opened before the profile (which carries the server's today) arrived: wait for it.
  const stop = watch(
    () => pilot.today,
    (today) => {
      if (!today) return;
      schedule.load(yearMonthOf(today));
      stop();
    },
  );
});

watch(
  () => schedule.current,
  (current) => {
    if (!current) return;
    router.replace({
      query: {
        year: String(current.year),
        month: String(current.month).padStart(2, '0'),
      },
    });
  },
);

const title = computed(() =>
  schedule.current ? formatMonthYear(schedule.current) : '',
);
const isEmpty = computed(
  () =>
    !schedule.loading &&
    !schedule.error &&
    schedule.current &&
    schedule.entries.length === 0,
);
</script>

<template>
  <div class="schedule">
    <header class="schedule__header">
      <h1 class="schedule__title">Schedule</h1>
    </header>

    <ErrorState
      v-if="!schedule.current && pilot.error"
      :message="pilot.error.message"
      @retry="pilot.load({ force: true })"
    />

    <div v-else class="calendar-card">
      <div class="month-nav">
        <button
          type="button"
          class="month-nav__button"
          aria-label="Previous month"
          :disabled="!schedule.current"
          @click="schedule.step(-1)"
        >
          <ChevronLeft :size="20" aria-hidden="true" />
        </button>
        <h2 class="month-nav__title" aria-live="polite">
          <template v-if="title">{{ title }}</template>
          <SkeletonBlock v-else height="20px" style="width: 120px" />
        </h2>
        <button
          type="button"
          class="month-nav__button"
          aria-label="Next month"
          :disabled="!schedule.current"
          @click="schedule.step(1)"
        >
          <ChevronRight :size="20" aria-hidden="true" />
        </button>
      </div>

      <ErrorState
        v-if="schedule.error"
        :message="schedule.error.message"
        @retry="schedule.current && schedule.load(schedule.current)"
      />

      <div
        v-else
        class="calendar-wrap"
        :class="{ 'is-loading': schedule.loading }"
        :aria-busy="schedule.loading"
      >
        <ScheduleCalendar
          v-if="schedule.current"
          :month="schedule.current"
          :entries-by-date="schedule.entriesByDate"
          :today="pilot.today"
        />
        <SkeletonBlock v-else height="300px" radius="10px" />
      </div>

      <p v-if="isEmpty" class="schedule__empty">
        No duties scheduled this month.
      </p>

      <div class="status-key">
        <span
          ><span class="status-key__badge" aria-hidden="true">2</span> Duties
          left to log</span
        >
        <span
          ><span
            class="status-key__badge status-key__badge--done"
            aria-hidden="true"
            ><Check :size="12" :stroke-width="3.5"
          /></span>
          All logged</span
        >
      </div>
    </div>

    <section
      v-if="schedule.legend.length"
      class="legend-card"
      aria-labelledby="legend-title"
    >
      <h2 id="legend-title" class="legend-card__title">Legend</h2>
      <DutyLegend :items="schedule.legend" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.schedule__header {
  padding: 20px 0 16px;
}

.schedule__title {
  font-size: 24px;
  font-weight: 800;
}

.calendar-card,
.legend-card {
  @include card;

  padding: 16px;

  @media (max-width: 359px) {
    padding: 12px;
  }
}

.legend-card {
  margin-top: 16px;
}

.legend-card__title {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 700;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.month-nav__title {
  display: flex;
  justify-content: center;
  font-size: 17px;
  font-weight: 700;
}

.month-nav__button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: var(--color-navy);
  background: var(--color-muted-surface);
  border: 0;
  border-radius: 50%;

  &:disabled {
    cursor: default;
    opacity: 0.4;
  }
}

.calendar-wrap {
  transition: opacity 0.2s;

  &.is-loading {
    opacity: 0.45;
  }
}

.schedule__empty {
  margin-top: 14px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
}

.status-key {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 16px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);

  > span {
    display: flex;
    gap: 6px;
    align-items: center;
  }
}

.status-key__badge {
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 3px 2px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  background: var(--color-brand-red);
  border-radius: $radius-pill;

  svg {
    display: block;
  }
}

.status-key__badge--done {
  padding: 0;
  background: var(--color-success);
}
</style>
