<script setup lang="ts">
useHead({ title: 'Logbook · Susi Air Pilot' });
</script>

<template>
  <div>
    <header class="page-header">
      <h1>Logbook</h1>
    </header>
    <ComingSoon
      title="Logbook coming soon"
      text="Logging flights from the app is not part of this release."
    />
  </div>
</template>

<style scoped lang="scss">
.page-header {
  padding: 20px 0 16px;

  h1 {
    font-size: 24px;
    font-weight: 800;
  }
}
</style>
