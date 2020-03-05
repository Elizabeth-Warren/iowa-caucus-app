<template>
  <div
    class="action-tray bg-liberty fixed inset-x-0 bottom-0 mt-auto"
    :class="visible && 'visible'"
  >
    <button
      class="w-full py-4 font-bold leading-none text-lg"
      type="button"
      @click="isTrayOpen = !isTrayOpen"
    >
      {{ isTrayOpen ? 'Close' : 'Actions'
      }}<ChevronIcon
        :direction="isTrayOpen ? 'down' : 'up'"
        class="ml-1 border-red text-xl"
      />
    </button>
    <transition name="expand">
      <div v-if="isTrayOpen" class="border-t-3 border-navy p-4">
        <BaseButton type="button" class="mb-4" @click="$emit('submit')">
          {{ isInitialAlignment ? 'Submit alignment' : 'Submit realignment' }}
        </BaseButton>
        <BaseButton
          type="button"
          level="tertiary"
          class="mb-4"
          @click="$emit('add')"
        >
          Add candidate
        </BaseButton>
        <BaseButton level="tertiary" tag="router-link" to="/help">
          I need help
        </BaseButton>
      </div>
    </transition>
  </div>
</template>

<script>
import BaseButton from '../components/BaseButton';
import ChevronIcon from '../components/ChevronIcon';

export default {
  components: { BaseButton, ChevronIcon },
  props: {
    isInitialAlignment: {
      type: Boolean,
      default: true,
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isTrayOpen: false,
    };
  },
};
</script>

<style lang="scss" scoped>
.action-tray {
  transform: translateY(100%);
  transition: transform 200ms ease-in-out;

  &.visible {
    transform: translateY(0);
  }
}

.expand-enter,
.expand-leave-to {
  max-height: 0;
}

.expand-enter-to,
.expand-leave {
  max-height: 100vh;
}

.expand-enter-active,
.expand-leave-active {
  overflow: hidden;
  transition: max-height 200ms ease-out;
}
</style>
