<template>
  <ModalWindow @close="$emit('close')">
    <div class="mx-8 my-6" @submit.prevent="handleSubmit">
      <h2 class="mb-4 text-lg">
        Are you sure you want to reset the app? This will clear all caucus
        results and log you out.
      </h2>
      <BaseButton class="mb-2" @click="resetApp">Reset</BaseButton>
      <BaseButton level="secondary" type="reset" @click="$emit('close')"
        >Cancel</BaseButton
      >
    </div>
  </ModalWindow>
</template>

<script>
import BaseButton from './BaseButton';
import ModalWindow from './ModalWindow';
import { mapActions } from 'vuex';

export default {
  components: { BaseButton, ModalWindow },
  methods: {
    ...mapActions(['resetApp']),
  },
};
</script>
