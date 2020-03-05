<template>
  <ModalWindow @close="$emit('close')">
    <form class="block mx-8 my-6" @submit.prevent="handleSubmit">
      <h2 class="mb-4 text-lg">Enter a candidate name</h2>
      <BaseInput
        v-model.trim="candidate"
        class="mb-4"
        label="Name"
        type="text"
        required
        @input="handleInputChange"
      />
      <div v-if="error" class="mb-2 text-brightRed">{{ error }}</div>
      <BaseButton class="mb-2">Submit</BaseButton>
      <BaseButton level="secondary" type="reset" @click="$emit('close')"
        >Cancel</BaseButton
      >
    </form>
  </ModalWindow>
</template>

<script>
import BaseButton from './BaseButton';
import BaseInput from './BaseInput';
import ModalWindow from './ModalWindow';
import { isCandidateNameWarning } from '../util/validateNewCandidate';
import { mapActions } from 'vuex';

export default {
  components: { BaseButton, BaseInput, ModalWindow },
  data() {
    return { candidate: '', error: null, shownWarningFor: null };
  },
  methods: {
    ...mapActions(['addCandidate']),
    handleSubmit() {
      this.error = null;
      try {
        this.addCandidate({
          name: this.candidate,
          skipValidation: this.shownWarningFor === this.candidate,
        });
        this.$emit('close');
      } catch (err) {
        this.error = err.message;
        if (isCandidateNameWarning(err)) {
          this.shownWarningFor = this.candidate;
        }
      }
    },
    handleInputChange() {
      this.hasWarned = false;
      this.error = null;
    },
  },
};
</script>
