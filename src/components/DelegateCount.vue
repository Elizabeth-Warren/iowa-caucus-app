<template functional>
  <div
    class="border-3 inline-flex items-center justify-center leading-none h-10 rounded-full text-xl w-10"
    :class="[
      data.class,
      data.staticClass,
      !props.delegates && 'opacity-50',
      (props.invalid || props.tied) && 'border-red',
      !props.tied && !props.invalid && 'border-navy',
    ]"
  >
    <span class="delegate-count font-bold relative">{{ props.delegates }}</span>
  </div>
</template>

<script>
export default {
  props: {
    delegates: {
      type: Number,
      default: 0,
    },
    invalid: {
      type: Boolean,
      default: false,
    },
    tied: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.delegate-count {
  top: -1px;
}
</style>
