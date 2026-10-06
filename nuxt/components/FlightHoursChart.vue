<script setup lang="ts">
import type { FlightHoursSummary } from '~/types/api';
import {
  formatDate,
  formatDayNumber,
  formatLongDate,
  formatWeekdayShort,
} from '~/utils/date';
import { formatHours } from '~/utils/format';

/**
 * Rolling-sum trend chart, drawn as plain SVG. It renders exactly what the API
 * returns: no sums are computed here, only the geometry to draw them.
 */
const props = defineProps<{ summary: FlightHoursSummary }>();

// Drawing area in viewBox units; the SVG scales to the card width.
const W = 340;
const H = 210;
const PAD = { top: 18, right: 10, bottom: 26, left: 34 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

const gradientId = useId();

const points = computed(() => props.summary.points);
const todayIndex = computed(() =>
  Math.max(
    points.value.findIndex((p) => p.isToday),
    0,
  ),
);

// The axis tops out at the configured max. Only if a value ever goes past it does the axis
// grow, so an extreme value is never clipped or drawn outside the card.
const yTop = computed(() => {
  const { yMax, peak } = props.summary;
  return peak > yMax ? Math.ceil(peak * 1.05) : yMax;
});

// Grid ticks, minus any that would crowd the limit label (the limit is labelled on the axis in red).
const yTicks = computed(() => {
  const step = niceStep(yTop.value / 5);
  const ticks: number[] = [];
  for (let t = 0; t <= yTop.value - step * 0.3; t += step) ticks.push(t);
  ticks.push(yTop.value);
  const minGap = 12; // viewBox units
  return ticks.filter(
    (tick) => Math.abs(y(tick) - y(props.summary.limit)) >= minGap,
  );
});

const x = (index: number) =>
  PAD.left + (index / Math.max(points.value.length - 1, 1)) * plotW;
const y = (value: number) => PAD.top + plotH - (value / yTop.value) * plotH;

const coords = computed(() =>
  points.value.map((p, i) => ({ ...p, cx: x(i), cy: y(p.value) })),
);

const linePath = (from: number, to: number) =>
  coords.value
    .slice(from, to + 1)
    .map((c, i) => `${i ? 'L' : 'M'}${c.cx.toFixed(1)},${c.cy.toFixed(1)}`)
    .join(' ');

const actualPath = computed(() => linePath(0, todayIndex.value));
const projectedPath = computed(() =>
  linePath(todayIndex.value, coords.value.length - 1),
);
const areaPath = computed(() => {
  const last = coords.value[todayIndex.value];
  const first = coords.value[0];
  if (!last || !first) return '';
  const base = (PAD.top + plotH).toFixed(1);
  return `${actualPath.value} L${last.cx.toFixed(1)},${base} L${first.cx.toFixed(1)},${base} Z`;
});

const limitY = computed(() => y(props.summary.limit));

// Tapped point; defaults to today, and resets to today when the range changes.
const selected = ref(todayIndex.value);
watch(
  () => props.summary,
  () => (selected.value = todayIndex.value),
);
const selectedPoint = computed(
  () => points.value[selected.value] ?? points.value[todayIndex.value],
);

const columnWidth = computed(
  () => plotW / Math.max(points.value.length - 1, 1),
);

function onKeydown(event: KeyboardEvent) {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
  if (!step) return;
  event.preventDefault();
  selected.value = Math.min(
    Math.max(selected.value + step, 0),
    points.value.length - 1,
  );
}

const hasPartialWindow = computed(() =>
  points.value.some((p) => p.partialWindow),
);
const windowLabel = computed(() => `${props.summary.windowDays}-day total`);

const ariaLabel = computed(() => {
  const s = props.summary;
  const today = points.value[todayIndex.value];
  return `Rolling ${s.windowDays}-day flight hours from ${formatDate(points.value[0]!.date)} to ${formatDate(
    points.value.at(-1)!.date,
  )}. Limit ${s.limit} hours. Today ${today ? formatHours(today.value) : '—'} hours.`;
});

function niceStep(raw: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalised = raw / magnitude;
  const nice =
    normalised <= 1
      ? 1
      : normalised <= 2
        ? 2
        : normalised <= 2.5
          ? 2.5
          : normalised <= 5
            ? 5
            : 10;
  return nice * magnitude;
}
</script>

<template>
  <div class="chart">
    <div v-if="selectedPoint" class="chart__readout" aria-live="polite">
      <div>
        <p class="chart__readout-date">
          {{ formatLongDate(selectedPoint.date) }}
          <span v-if="selectedPoint.isToday" class="chip chip--today"
            >Today</span
          >
          <span v-else-if="selectedPoint.projected" class="chip chip--projected"
            >Planned</span
          >
        </p>
        <p class="chart__readout-value">
          <strong :class="{ 'is-over': selectedPoint.exceedsLimit }"
            >{{ formatHours(selectedPoint.value) }} h</strong
          >
          <span>{{ windowLabel }}</span>
        </p>
      </div>
      <span v-if="selectedPoint.exceedsLimit" class="chip chip--over">
        Over by {{ formatHours(selectedPoint.value - summary.limit) }} h
      </span>
    </div>

    <svg
      class="chart__svg"
      :viewBox="`0 0 ${W} ${H}`"
      role="img"
      :aria-label="ariaLabel"
      tabindex="0"
      @keydown="onKeydown"
      @pointerdown.prevent
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stop-color="var(--color-accent)"
            stop-opacity="0.28"
          />
          <stop
            offset="100%"
            stop-color="var(--color-accent)"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>

      <!-- Y grid and labels -->
      <g class="chart__grid">
        <g v-for="tick in yTicks" :key="tick">
          <line
            :x1="PAD.left"
            :x2="W - PAD.right"
            :y1="y(tick)"
            :y2="y(tick)"
          />
          <text
            :x="PAD.left - 6"
            :y="y(tick)"
            text-anchor="end"
            dominant-baseline="middle"
          >
            {{ tick }}
          </text>
        </g>
      </g>

      <!-- Today marker -->
      <line
        class="chart__today-line"
        :x1="x(todayIndex)"
        :x2="x(todayIndex)"
        :y1="PAD.top"
        :y2="PAD.top + plotH"
      />

      <!-- Series -->
      <path class="chart__area" :d="areaPath" :fill="`url(#${gradientId})`" />
      <path class="chart__line" :d="actualPath" />
      <path class="chart__line chart__line--projected" :d="projectedPath" />

      <!-- Limit line, drawn over the series so it always reads clearly -->
      <g class="chart__limit">
        <line :x1="PAD.left" :x2="W - PAD.right" :y1="limitY" :y2="limitY" />
        <text
          :x="PAD.left - 6"
          :y="limitY"
          text-anchor="end"
          dominant-baseline="middle"
        >
          {{ summary.limit }}
        </text>
      </g>

      <!-- Points -->
      <g v-for="(c, i) in coords" :key="c.date">
        <circle
          class="chart__dot"
          :class="{
            'is-over': c.exceedsLimit,
            'is-projected': c.projected,
            'is-selected': i === selected,
          }"
          :cx="c.cx"
          :cy="c.cy"
          :r="i === selected ? 5 : 3"
        />
      </g>

      <!-- X labels -->
      <g class="chart__x-labels">
        <text
          v-for="(c, i) in coords"
          :key="c.date"
          :x="c.cx"
          :y="H - 8"
          text-anchor="middle"
          :class="{ 'is-today': c.isToday, 'is-selected': i === selected }"
        >
          {{ formatDayNumber(c.date) }}
        </text>
      </g>

      <!-- Tap targets: one column per day -->
      <rect
        v-for="(c, i) in coords"
        :key="`hit-${c.date}`"
        class="chart__hit"
        :x="c.cx - columnWidth / 2"
        :y="0"
        :width="columnWidth"
        :height="H"
        @click="selected = i"
        @pointerenter="selected = i"
      />
    </svg>

    <ul class="chart__legend">
      <li><span class="swatch swatch--actual" />Flown</li>
      <li><span class="swatch swatch--projected" />Planned</li>
      <li><span class="swatch swatch--limit" />Limit {{ summary.limit }} h</li>
    </ul>

    <p v-if="hasPartialWindow" class="chart__note">
      Some totals reach back before the first logged day; those days count as 0
      h.
    </p>

    <!-- Wrapped because a <table> ignores width:1px and would push the page wider on small screens -->
    <div class="visually-hidden">
      <table>
        <caption>
          Rolling
          {{
            summary.windowDays
          }}-day flight hours
        </caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Hours</th>
            <th scope="col">Note</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in points" :key="p.date">
            <td>{{ formatWeekdayShort(p.date) }} {{ formatDate(p.date) }}</td>
            <td>{{ formatHours(p.value) }}</td>
            <td>
              {{
                [
                  p.isToday && 'today',
                  p.projected && 'planned',
                  p.exceedsLimit && 'over limit',
                ]
                  .filter(Boolean)
                  .join(', ')
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart__readout {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: space-between;
  min-height: 52px;
}

.chart__readout-date {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.chart__readout-value {
  display: flex;
  gap: 6px;
  align-items: baseline;

  strong {
    @include numeric;

    font-size: 26px;
    line-height: 1.2;

    &.is-over {
      color: var(--color-danger);
    }
  }

  span {
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}

.chip {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  border-radius: $radius-pill;
}

.chip--today {
  color: #fff;
  background: var(--color-navy);
}

.chip--projected {
  color: var(--color-text-secondary);
  background: var(--color-muted-surface);
}

.chip--over {
  color: var(--color-danger);
  background: rgb(230 55 87 / 10%);
}

.chart__svg {
  width: 100%;
  height: auto;
  overflow: visible;
  touch-action: pan-y;
  border-radius: 6px;

  &:focus-visible {
    @include focus-ring;
  }
}

.chart__grid {
  line {
    stroke: var(--color-border);
    stroke-width: 1;
  }

  text {
    font-size: 10px;
    font-weight: 600;
    fill: var(--color-text-secondary);
  }
}

.chart__today-line {
  stroke: var(--color-navy);
  stroke-dasharray: 2 3;
  stroke-opacity: 0.35;
}

.chart__line {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart__line--projected {
  stroke-dasharray: 5 5;
  stroke-opacity: 0.75;
}

.chart__limit {
  line {
    stroke: var(--color-danger);
    stroke-width: 1.5;
  }

  text {
    font-size: 10px;
    font-weight: 700;
    fill: var(--color-danger);
  }
}

.chart__dot {
  fill: var(--color-accent);
  stroke: var(--color-surface);
  stroke-width: 1.5;
  transition: r 0.15s;

  &.is-projected {
    fill: var(--color-surface);
    stroke: var(--color-accent);
  }

  &.is-over {
    fill: var(--color-danger);
    stroke: var(--color-surface);
  }

  &.is-over.is-projected {
    fill: var(--color-surface);
    stroke: var(--color-danger);
  }

  &.is-selected {
    stroke-width: 2.5;
  }
}

.chart__x-labels text {
  font-size: 10px;
  font-weight: 600;
  fill: var(--color-text-secondary);

  &.is-selected {
    fill: var(--color-text);
  }

  &.is-today {
    font-weight: 800;
    fill: var(--color-brand-red);
  }
}

.chart__hit {
  cursor: pointer;
  fill: transparent;
}

.chart__legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 0;
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  list-style: none;

  li {
    display: flex;
    gap: 6px;
    align-items: center;
  }
}

.swatch {
  width: 16px;
  height: 0;
  border-top: 2.5px solid var(--color-accent);
}

.swatch--projected {
  border-top-style: dashed;
}

.swatch--limit {
  border-top: 1.5px solid var(--color-danger);
}

.chart__note {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-align: center;
}

.visually-hidden {
  @include visually-hidden;
}
</style>
