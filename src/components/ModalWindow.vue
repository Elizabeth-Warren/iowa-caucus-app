<template>
  <portal to="modal">
    <div
      class="fixed inset-0 bg-navy opacity-50 z-40"
      @click="$emit('close')"
    />
    <FocusLock>
      <div class="modal-window fixed bg-white w-full z-50">
        <slot />
      </div>
    </FocusLock>
  </portal>
</template>

<script>
import FocusLock from 'vue-focus-lock';

export default {
  components: { FocusLock },
};
</script>

<style lang="scss" scoped>
.modal-window {
  left: 50%;
  max-height: 80vh;
  max-width: 80vw;
  overflow: auto;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
