<template>
  <label class="base-input block">
    <div v-if="label" class="block mb-2">{{ label }}</div>
    <component
      :is="component"
      v-bind="attrs"
      class="block w-full text-navy p-2 border-2 border-navy"
      :value="value"
      :type="type"
      v-on="{
        ...$listeners,
        input(e) {
          const val = type === 'tel' ? e : e.target.value;
          $emit('input', val);
        },
      }"
    />
  </label>
</template>

<script>
import { TheMask } from 'vue-the-mask';

export default {
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      default: null,
    },
    value: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
  },
  computed: {
    component() {
      return this.type === 'tel' ? TheMask : 'input';
    },
    attrs() {
      const attrs = {
        ...this.$attrs,
      };
      if (this.type === 'tel') {
        attrs.mask = '(###) ###-####';
      }
      return attrs;
    },
  },
};
</script>
