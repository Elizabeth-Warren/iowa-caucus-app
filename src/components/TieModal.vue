<template>
  <ModalWindow @close="$emit('close')">
    <form
      class="block mx-8 my-6"
      data-test="tie-form"
      data-tracking="caucus-form-tie"
      @submit.prevent="handleSubmit"
    >
      <h2 class="text-lg">There's a tie! Who won?</h2>
      <p v-if="requiredCount">
        {{
          requiredCount !== 1
            ? `Pick ${requiredCount} candidates`
            : `Pick one candidate`
        }}
      </p>
      <div v-if="error" class="text-brightRed">{{ error }}</div>
      <div class="mb-12 mt-10">
        <label
          v-for="name in tieBeingResolved"
          :key="name"
          class="flex items-center mb-5"
        >
          <input
            v-model="selected"
            class="checkbox"
            type="checkbox"
            :value="name"
          />
          <span class="flex-grow text-lg font-bold">{{ name }}</span>
        </label>
      </div>
      <BaseButton data-test="submit-tie" :disabled="!isValid"
        >Submit</BaseButton
      >
    </form>
  </ModalWindow>
</template>

<script>
import BaseButton from './BaseButton';
import ModalWindow from './ModalWindow';
import TieStatuses from '../constants/TieStatuses';
import cloneDeep from 'lodash/cloneDeep';
import sumBy from 'lodash/sumBy';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  components: { BaseButton, ModalWindow },
  data() {
    return { selected: [], error: null };
  },
  computed: {
    ...mapState(['finalResults']),
    ...mapGetters(['pendingTies', 'totalDelegates']),
    tieBeingResolved() {
      return this.pendingTies[0] || [];
    },
    /**
     * Returns the number of selections the user must make.
     * @returns {number}
     */
    requiredCount() {
      // If this is a two-way tie then just one person can be the winner.
      if (this.tieBeingResolved.length === 2) {
        return 1;
      }
      const assignedDelegates = sumBy(this.finalResults, 'delegates');
      return (
        this.tieBeingResolved.length - (assignedDelegates - this.totalDelegates)
      );
    },
    isValid() {
      return (
        this.selected.length !== this.tieBeingResolved.length &&
        (this.requiredCount
          ? this.selected.length === this.requiredCount
          : !!this.selected.length)
      );
    },
  },
  watch: {
    // If there are no more pending ties, we can close this modal and proceed to
    // final review.
    pendingTies(newValue) {
      if (!newValue.length) {
        this.$emit('close');
        this.$router.push('final-review');
      }
    },
  },
  methods: {
    ...mapActions(['setFinalResults']),
    handleSubmit() {
      this.error = null;
      if (!this.isValid) {
        this.error = `You must choose ${
          this.requiredCount !== 1
            ? this.requiredCount + ' winners'
            : 'one winner'
        }.`;
        return;
      }

      // Make a copy of the pending final results. Find any candidates included
      // with the tie being currently resolved. If they were not selected as a
      // winner of the tie, remove one of their delegates.
      const newResults = cloneDeep(this.finalResults);
      const { selected, tieBeingResolved } = this;
      newResults.forEach((candidate) => {
        if (tieBeingResolved.includes(candidate.name)) {
          if (selected.includes(candidate.name)) {
            candidate.tieStatus = TieStatuses.WON;
          } else {
            candidate.delegates--;
            candidate.tieStatus = TieStatuses.LOST;
          }
        }
      });
      this.selected = [];
      this.setFinalResults(newResults);
    },
  },
};
</script>

<style lang="scss" scoped>
.checkbox {
  @apply appearance-none border-navy border-3 mr-4 relative;
  height: 30px;
  width: 30px;

  &:checked {
    @apply bg-liberty;

    &::after {
      @apply absolute block text-lg;
      content: '✓';
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
