<template>
  <TheViewContainer
    tag="form"
    :data-tracking="
      isInitialReview ? 'caucus-form-alignment' : 'caucus-form-realignment'
    "
    @submit.prevent="handleSubmit"
  >
    <TheHeader>Review</TheHeader>
    <TheBody>
      <div class="bg-white mb-3">
        <div class="border-b-3 border-offWhite px-4 py-6 text-center">
          <p v-if="warrenDelegates" class="text-lg mb-2">
            We won {{ warrenDelegates }} delegate{{
              warrenDelegates !== 1 ? 's' : ''
            }}!
          </p>
          <div :class="{ 'text-red': assignedDelegates > totalDelegates }">
            <b data-test="delegates-assigned">
              {{ assignedDelegates }}/{{ totalDelegates }}
            </b>
            delegates assigned
          </div>
          <div :class="{ 'text-red': assignedCaucusers > totalAttendees }">
            <b data-test="attendees-counted">
              {{ assignedCaucusers }}/{{ totalAttendees }}
            </b>
            attendees counted
          </div>
        </div>
        <div
          v-for="{ name, delegates, tieStatus } in candidates"
          :key="name"
          class="border-b-3 border-offWhite flex items-center justify-between px-12 py-6 last:border-b-0"
          :data-test="`review-row-${name.toLowerCase()}`"
        >
          <div>
            <div class="font-bold text-lg">{{ name }}</div>
            <div v-if="isTied(tieStatus)" class="font-normal text-sm text-red">
              Tied
            </div>
          </div>
          <DelegateCount :delegates="delegates" :tied="isTied(tieStatus)" />
        </div>
      </div>
      <BaseButton class="mb-4" data-test="submit">Submit</BaseButton>
      <BaseButton
        class="mb-4"
        level="tertiary"
        tag="router-link"
        :to="isInitialReview ? 'align' : 'realign'"
        >Adjust results</BaseButton
      >
    </TheBody>
    <StickyHelpButton />
    <RealignmentModal
      v-if="isShowingRealignmentModal"
      @close="isShowingRealignmentModal = false"
      @yes="sendResults(true)"
      @no="sendResults"
    />
  </TheViewContainer>
</template>

<script>
import BaseButton from '../components/BaseButton';
import DelegateCount from '../components/DelegateCount';
import NotificationTypes from '../constants/NotificationTypes';
import RealignmentModal from '../components/RealignmentModal';
import StickyHelpButton from '../components/StickyHelpButton';
import TheBody from '../components/TheBody';
import TheHeader from '../components/TheHeader';
import TheViewContainer from '../components/TheViewContainer';
import TieStatuses from '../constants/TieStatuses';
import some from 'lodash/some';
import sumBy from 'lodash/sumBy';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  components: {
    BaseButton,
    DelegateCount,
    RealignmentModal,
    StickyHelpButton,
    TheBody,
    TheHeader,
    TheViewContainer,
  },
  props: {
    isInitialReview: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { isShowingRealignmentModal: false };
  },
  computed: {
    ...mapState(['finalResults', 'precinctId', 'totalAttendees', 'userPhone']),
    ...mapGetters([
      'assignedCaucusers',
      'candidateStatuses',
      'fullFinalResults',
      'totalDelegates',
      'viableCandidates',
    ]),
    candidates() {
      return this.isInitialReview
        ? this.viableCandidates
        : this.finalResults.filter((candidate) => candidate.delegates > 0);
    },
    assignedDelegates() {
      return sumBy(this.candidates, 'delegates');
    },
    warrenDelegates() {
      const warren = this.candidates.find(
        (candidate) => candidate.name === 'Warren'
      );
      return warren ? warren.delegates : 0;
    },
  },
  methods: {
    ...mapActions(['showToast', 'submitReporting']),
    handleSubmit() {
      // If this is the review after first alignment and there are no ties that
      // need to be resolved, ask the user if there will be a realignment.
      if (this.isInitialReview) {
        if (some(this.candidates, (candidate) => candidate.ties.length)) {
          this.sendResults(true);
        } else {
          this.isShowingRealignmentModal = true;
        }
      } else {
        this.sendResults();
      }
    },
    sendResults(willShowRealignment = false) {
      this.submitReporting({
        event_type: this.isInitialReview ? 'alignment' : 'realignment',
        results: this.isInitialReview
          ? this.candidateStatuses
          : this.fullFinalResults,
      }).catch(({ message }) => {
        this.showToast({ message, type: NotificationTypes.WARNING });
      });
      if (this.isInitialReview && willShowRealignment) {
        this.$router.push('realign');
      } else {
        this.$router.push('check-out');
      }
    },
    isTied(status) {
      return status === TieStatuses.UNRESOLVED;
    },
  },
};
</script>
