<template>
  <main class="blank">
    <WakeBanner />
    <slot />
  </main>
</template>

<style scoped lang="scss">
.blank {
  max-width: $shell-max-width;
  min-height: 100dvh;
  margin: 0 auto;
}
</style>
