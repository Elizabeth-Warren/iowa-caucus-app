<template>
  <header
    class="text-center p-4 sticky top-0 inset-x-0 relative z-10"
    :class="{
      'text-white': level === 'primary',
      'bg-navy': level === 'primary',
      'bg-liberty': level === 'secondary',
    }"
  >
    <h1 class="font-bold font-wide text-xl uppercase"><slot /></h1>
    <button
      v-if="showBackButton"
      class="absolute top-0 left-0 mt-4 ml-4 font-bold"
      type="button"
      @click="goBack"
    >
      <ChevronIcon direction="left border-red text-lg mr-1" /> Back
    </button>
  </header>
</template>

<script>
import ChevronIcon from './ChevronIcon';

export default {
  components: { ChevronIcon },
  props: {
    showBackButton: {
      type: Boolean,
      default: true,
    },
    level: {
      type: String,
      default: 'primary',
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>
