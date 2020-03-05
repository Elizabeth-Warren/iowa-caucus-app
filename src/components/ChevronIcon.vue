<template functional>
  <span
    :class="[data.class, data.staticClass, props.direction, 'chevron-icon']"
  ></span>
</template>

<script>
export default {
  props: {
    direction: {
      type: String,
      default: 'right',
    },
  },
};
</script>

<style lang="scss" scoped>
.chevron-icon::before {
  border-color: inherit;
  border-style: solid;
  border-width: 0.15em 0.15em 0 0;
  content: '';
  display: inline-block;
  height: 0.5em;
  left: 0.15em;
  position: relative;
  top: 0.5em;
  transform: rotate(-45deg);
  vertical-align: top;
  width: 0.5em;
}

.chevron-icon.right:before {
  left: 0;
  top: 0.4em;
  transform: rotate(45deg);
}

.chevron-icon.down:before {
  top: 0.3em;
  transform: rotate(135deg);
}

.chevron-icon.left:before {
  transform: rotate(-135deg);
}
</style>
