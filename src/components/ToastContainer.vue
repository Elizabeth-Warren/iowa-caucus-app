<template>
  <transition-group
    tag="div"
    class="fixed inset-x-0 top-0 z-50"
    name="push-down"
  >
    <ToastNotification
      v-for="{ id, message, type, actions } in items"
      :id="id"
      :key="id"
      :message="message"
      :type="type"
      :actions="actions"
      @close="$emit('close', $event)"
    />
  </transition-group>
</template>

<script>
import ToastNotification from './ToastNotification';

export default {
  components: { ToastNotification },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.push-down-enter,
.push-down-leave-to {
  transform: translateY(-100%);
}

.push-down-enter-to,
.push-down-leave {
  transform: translateY(0);
}

.push-down-enter-active,
.push-down-leave-active {
  transition: transform 200ms ease-out;
}
</style>
