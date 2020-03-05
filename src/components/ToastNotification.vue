<template>
  <div class="items-start flex p-4 z-50" :class="bgClass">
    <p class="mr-2">
      <span v-html="message" />
      <span v-if="actions.length" className="inline-flex">
        <button
          v-for="item in actions"
          :key="item.label"
          class="mr-2 font-bold uppercase cursor-pointer"
          type="button"
          @click="item.handler(id)"
        >
          {{ item.label }}
        </button>
      </span>
    </p>
    <button
      class="close-btn font-bold text-xl ml-auto text-red"
      @click="$emit('close', id)"
    >
      &times;
    </button>
  </div>
</template>

<script>
import NotifcationTypes from '../constants/NotificationTypes';

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'default',
    },
    actions: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    bgClass() {
      switch (this.type) {
        case NotifcationTypes.WARNING:
          return 'bg-yellow';
        default:
          return 'bg-lightLiberty';
      }
    },
  },
};
</script>

<style scoped>
.close-btn {
  line-height: 0.8;
}
</style>
