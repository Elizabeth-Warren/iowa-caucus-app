<template>
  <component
    :is="tag"
    class="font-bold font-compressed p-4 text-center uppercase text-xl"
    :class="{
      'bg-purple': level === 'primary',
      'bg-liberty': level === 'secondary',
      'bg-navy': level === 'tertiary',
      'text-white': level === 'primary' || level === 'tertiary',
      'text-navy': level === 'secondary',
      block: block,
      'w-full': block,
      'inline-block': !block,
      'opacity-50': disabled,
      'cursor-not-allowed': disabled,
    }"
    :disabled="disabled"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </component>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    tag: {
      type: String,
      default: 'button',
    },
    level: {
      type: String,
      default: 'primary',
    },
    block: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
