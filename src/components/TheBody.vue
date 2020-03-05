<template functional>
  <main
    id="content"
    class="the-body relative px-4 z-0"
    :class="[data.class, data.staticClass, props.level]"
  >
    <slot />
  </main>
</template>

<script>
export default {
  props: {
    level: {
      type: String,
      default: 'primary',
    },
  },
};
</script>

<style scoped>
.the-body::after {
  content: '';
  display: block;
  height: 100px;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  z-index: -1;
}

.the-body.primary::after {
  @apply bg-navy;
}

.the-body.secondary::after {
  @apply bg-liberty;
}
</style>
