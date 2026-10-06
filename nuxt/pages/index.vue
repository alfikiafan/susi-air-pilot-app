<script setup lang="ts">
import type { FlightHoursSummary, RangeKey } from '~/types/api';

useHead({ title: 'Home · Susi Air Pilot' });

const flightHours = useFlightHoursStore();
const documents = useDocumentsStore();

onMounted(() => {
  flightHours.load();
  documents.load();
});

const range = computed({
  get: () => flightHours.range,
  set: (next: RangeKey) => flightHours.load(next),
});

// Keep the previous chart on screen (dimmed) while a new range loads, instead of flashing a skeleton.
const shownSummary = ref<FlightHoursSummary | null>(null);
watch(
  () => flightHours.summary,
  (summary) => {
    if (summary) shownSummary.value = summary;
  },
  { immediate: true },
);
const isSwitchingRange = computed(
  () => flightHours.loading && shownSummary.value?.range !== flightHours.range,
);
</script>

<template>
  <div class="home">
    <HomeHeader />

    <section class="section" aria-labelledby="limits-title">
      <h2 id="limits-title" class="section__title">Hours to Limit</h2>

      <ErrorState
        v-if="flightHours.error && !flightHours.cards.length"
        :message="flightHours.error.message"
        @retry="flightHours.load(flightHours.range, { force: true })"
      />

      <template v-else>
        <div class="limits-grid">
          <template v-if="flightHours.cards.length">
            <LimitCard
              v-for="card in flightHours.cards"
              :key="card.key"
              :card="card"
            />
          </template>
          <template v-else>
            <SkeletonBlock
              v-for="n in 4"
              :key="n"
              height="128px"
              radius="14px"
            />
          </template>
        </div>

        <div class="trend-card">
          <div class="trend-card__head">
            <h3 class="trend-card__title">Flight Hours Trend</h3>
            <RangeToggle v-model="range" />
          </div>

          <ErrorState
            v-if="flightHours.error"
            :message="flightHours.error.message"
            @retry="flightHours.load(flightHours.range, { force: true })"
          />
          <div
            v-else-if="shownSummary"
            :class="{ 'is-loading': isSwitchingRange }"
            :aria-busy="isSwitchingRange"
          >
            <FlightHoursChart :summary="shownSummary" />
          </div>
          <SkeletonBlock v-else height="260px" radius="10px" />
        </div>
      </template>
    </section>

    <section class="section" aria-labelledby="documents-title">
      <h2 id="documents-title" class="section__title">My Documents</h2>
      <div class="documents-card">
        <ErrorState
          v-if="documents.error"
          :message="documents.error.message"
          @retry="documents.load({ force: true })"
        />
        <ul v-else-if="documents.loaded" class="documents-list">
          <DocumentItem
            v-for="doc in documents.documents"
            :key="doc.id"
            :document="doc"
          />
        </ul>
        <div v-else class="documents-skeleton">
          <SkeletonBlock v-for="n in 3" :key="n" height="44px" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.section {
  margin-top: 24px;
}

.section__title {
  margin-bottom: 12px;
  font-size: 17px;
  font-weight: 700;
}

.limits-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.trend-card,
.documents-card {
  @include card;

  margin-top: 12px;
  padding: 16px;
}

.documents-card {
  padding-block: 2px;
}

.trend-card__head {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.trend-card__title {
  font-size: 15px;
  font-weight: 700;
}

.is-loading {
  opacity: 0.5;
  transition: opacity 0.2s;
}

.documents-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.documents-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 0;
}
</style>
