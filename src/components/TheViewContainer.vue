<template functional>
  <component
    :is="props.tag"
    :class="[data.class, data.staticClass, 'flex', 'flex-col', 'flex-grow']"
    v-on="listeners"
  >
    <slot />
  </component>
</template>

<script>
export default {
  props: {
    tag: {
      type: String,
      default: 'div',
    },
  },
};
</script>
