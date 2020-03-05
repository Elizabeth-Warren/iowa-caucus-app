<template>
  <ModalWindow @close="$emit('close')">
    <div class="mx-8 my-6" @submit.prevent="handleSubmit">
      <h2 class="mb-4 text-lg">
        Are you sure you want to remove <strong>{{ candidate }}</strong
        >?
      </h2>
      <div v-if="error" class="mb-2 text-brightRed">{{ error }}</div>
      <BaseButton class="mb-2" @click="handleRemove">Remove</BaseButton>
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
  props: {
    candidate: {
      type: String,
      required: true,
    },
  },
  data() {
    return { error: null };
  },
  methods: {
    ...mapActions(['removeCandidate']),
    handleRemove() {
      this.error = null;
      try {
        this.removeCandidate(this.candidate);
        this.$emit('close');
      } catch (err) {
        this.error = err.message;
      }
    },
  },
};
</script>
