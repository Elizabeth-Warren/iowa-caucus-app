<template>
  <ModalWindow @close="$emit('close')">
    <div class="block mx-8 my-6" data-test="realignment-modal">
      <h2 class="mb-4 text-lg">Is there a realignment?</h2>
      <BaseButton
        class="mb-2"
        type="button"
        data-test="realignment-confirm"
        data-tracking="caucus-confirm-realignment"
        @click="$emit('yes')"
        >Yes</BaseButton
      >
      <BaseButton
        level="secondary"
        type="button"
        data-tracking="caucus-skip-realignment"
        @click="$emit('no')"
        >No</BaseButton
      >
    </div>
  </ModalWindow>
</template>

<script>
import BaseButton from './BaseButton';
import ModalWindow from './ModalWindow';

export default {
  components: { BaseButton, ModalWindow },
};
</script>
