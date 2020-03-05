<template>
  <TheViewContainer>
    <TheHeader>{{ isInitialAlignment ? 'Align' : 'Realign' }}</TheHeader>
    <TheBody>
      <div v-if="error" class="bg-white mb-2 text-brightRed p-2">
        {{ error }}
      </div>
      <div
        v-if="isInitialAlignment"
        class="bg-liberty sm:flex items-center mb-1 px-4 py-3"
        data-test="attendee-count"
      >
        <p class="flex-grow mb-4 sm:mb-0 leading-tight">
          Enter the <strong>total</strong> number of people at your caucus. Wait
          for the <strong>official</strong> count before submitting!
        </p>
        <div class="text-center">
          <CaucuserCounter
            :value="totalAttendees"
            :large="true"
            @input="handleAttendeeUpdate"
          />
        </div>
      </div>
      <div class="mb-4 text-center bg-liberty p-4 tracking-tight">
        A candidate needs
        <b data-test="viability-threshold">{{ viability }}</b> to be viable
      </div>
      <div class="bg-white mb-3">
        <CandidateTable
          v-bind="tableProps"
          :is-initial-alignment="isInitialAlignment"
          @input="setCount($event.name, $event.value)"
          @remove="candidateToRemove = $event"
        />
      </div>
      <Intersect
        :threshold="[0, 1]"
        @enter="isShowingTray = false"
        @leave="isShowingTray = true"
      >
        <div>
          <BaseButton class="mb-4" data-test="submit" @click="handleSubmit">
            {{ isInitialAlignment ? 'Submit alignment' : 'Submit realignment' }}
          </BaseButton>
          <BaseButton
            class="mb-4"
            level="tertiary"
            tag="router-link"
            to="/help"
          >
            I need help
          </BaseButton>
        </div>
      </Intersect>
    </TheBody>
    <ActionTray
      :visible="isShowingTray"
      :is-initial-alignment="isInitialAlignment"
      @submit="handleSubmit"
      @add="isShowingAddModal = true"
    />
    <AddCandidateModal
      v-if="isShowingAddModal"
      @close="isShowingAddModal = false"
    />
    <RemoveCandidateModal
      v-if="candidateToRemove"
      :candidate="candidateToRemove"
      @close="candidateToRemove = null"
    />
    <TieModal v-if="isShowingTieModal" @close="isShowingTieModal = false" />
  </TheViewContainer>
</template>

<script>
import ActionTray from '../components/ActionTray';
import AddCandidateModal from '../components/AddCandidateModal';
import BaseButton from '../components/BaseButton';
import CandidateTable from '../components/CandidateTable';
import CaucuserCounter from '../components/CaucuserCounter';
import Intersect from 'vue-intersect';
import NotificationTypes from '../constants/NotificationTypes';
import RemoveCandidateModal from '../components/RemoveCandidateModal';
import TheBody from '../components/TheBody';
import TheHeader from '../components/TheHeader';
import TheViewContainer from '../components/TheViewContainer';
import TieModal from '../components/TieModal';
import cloneDeep from 'lodash/cloneDeep';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  components: {
    ActionTray,
    AddCandidateModal,
    BaseButton,
    CandidateTable,
    CaucuserCounter,
    Intersect,
    RemoveCandidateModal,
    TheBody,
    TheHeader,
    TheViewContainer,
    TieModal,
  },
  props: {
    isInitialAlignment: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      candidateToRemove: null,
      error: null,
      isShowingAddModal: false,
      isShowingTieModal: false,
      isShowingTray: true,
    };
  },
  computed: {
    ...mapState(['alignmentFloors', 'totalAttendees']),
    ...mapGetters([
      'assignedCaucusers',
      'assignedDelegates',
      'candidateStatuses',
      'pendingTies',
      'totalDelegates',
      'viabilityThreshold',
    ]),
    isOverCountingAttendees() {
      return this.assignedCaucusers > this.totalAttendees;
    },
    tableProps() {
      const {
        alignmentFloors,
        assignedCaucusers,
        assignedDelegates,
        candidateStatuses,
        totalAttendees,
        totalDelegates,
      } = this;
      return {
        alignmentFloors: this.isInitialAlignment ? {} : alignmentFloors,
        assignedCaucusers,
        assignedDelegates,
        candidateStatuses,
        totalAttendees,
        totalDelegates,
      };
    },
    viability() {
      if (this.viabilityThreshold === 'simple majority') {
        return `a simple majority`;
      }
      if (this.viabilityThreshold === 1) {
        return `${this.viabilityThreshold} attendee`;
      }
      return `${this.viabilityThreshold} attendees`;
    },
  },
  watch: {
    isOverCountingAttendees(newValue) {
      this.toggleOverCountToast(newValue);
    },
  },
  methods: {
    ...mapActions([
      'removeToast',
      'setAlignmentFloors',
      'setCaucuserCount',
      'setFinalResults',
      'setTotalAttendees',
      'showToast',
    ]),
    setCount(name, count) {
      this.error = null;
      try {
        this.setCaucuserCount({ name, count });
      } catch (err) {
        this.error = err.message;
      }
    },
    handleAttendeeUpdate(val) {
      const count = val ? parseInt(val, 10) : 0;
      this.setTotalAttendees(count);
    },
    handleSubmit() {
      if (this.isInitialAlignment) {
        this.setAlignmentFloors();
        this.$router.push('review');
      } else {
        const finalResults = cloneDeep(this.candidateStatuses);
        this.setFinalResults(finalResults);

        // Any pending ties will trigger the TieModal to appear. Resolving that
        // will advance the user to the `final-review` screen.
        if (this.pendingTies.length) {
          this.isShowingTieModal = true;
        } else {
          this.$router.push('final-review');
        }
      }
    },
    toggleOverCountToast(show) {
      const id = 'over-count';
      if (show) {
        this.showToast({
          id: 'over-count',
          message:
            'Warning: number of attendees assigned exceeds total attendees.',
          type: NotificationTypes.WARNING,
          dismissAfter: 0,
        });
      } else {
        this.removeToast(id);
      }
    },
  },
};
</script>
