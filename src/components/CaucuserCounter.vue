<template>
  <div class="inline-flex items-stretch">
    <input
      ref="input"
      :value="displayedValue"
      type="number"
      step="1"
      min="0"
      pattern="[0-9]*"
      class="bg-transparent number-input appearance-none font-bold mr-4 text-center text-right"
      :class="{
        'w-8': !large,
        'sm:w-12': !large,
        'sm:text-lg': !large && value.toString().length >= 4,
        'sm:text-xl': !large && value.toString().length < 4,
        'w-24': large,
        'text-xl': large && value.toString().length >= 3,
        'text-2xl': large && value.toString().length < 3,
      }"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div class="flex flex-col">
      <button class="button-action mb-2" type="button" @mousedown="increment">
        +
      </button>
      <button class="button-action" type="button" @mousedown.stop="decrement">
        -
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    large: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { hasFocus: false };
  },
  computed: {
    displayedValue() {
      return this.hasFocus && !this.value ? '' : this.value;
    },
  },
  methods: {
    increment() {
      const $input = this.$refs.input;
      const newValue = parseInt($input.value, 10) + 1;
      $input.value = newValue;
      this.$emit('input', newValue);
    },
    decrement() {
      const $input = this.$refs.input;
      const newValue = parseInt($input.value, 10) - 1;
      if (newValue < 0) {
        return;
      }
      $input.value = newValue;
      this.$emit('input', newValue);
    },
    handleInput(e) {
      const value = e.target.value ? parseInt(e.target.value, 10) : 0;
      this.$emit('input', value);
    },
    handleFocus() {
      this.hasFocus = true;
    },
    handleBlur() {
      this.hasFocus = false;
    },
  },
};
</script>

<style scoped>
.number-input::-webkit-inner-spin-button,
.number-input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}

.button-action {
  @apply font-bold bg-lightLiberty leading-none flex-grow px-3 py-2 text-xl;
  touch-action: manipulation;
}
</style>
