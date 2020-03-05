<template>
  <table class="w-full relative">
    <thead>
      <tr>
        <th class="table-header pl-2 sm:pl-3 text-left">
          Candidate
        </th>
        <th class="table-header text-center">
          Delegates
          <div
            class="text-sm whitespace-no-wrap"
            :class="{ 'text-red': assignedDelegates > totalDelegates }"
            data-test="delegates-assigned"
          >
            <b>{{ assignedDelegates }}/{{ totalDelegates }}</b> assigned
          </div>
        </th>
        <th class="table-header pr-2 sm:pr-3 text-right">
          Attendees
          <div
            class="text-sm whitespace-no-wrap"
            :class="{ 'text-red': assignedCaucusers > totalAttendees }"
            data-test="attendees-counted"
          >
            <b>{{ assignedCaucusers }}/{{ totalAttendees }}</b> counted
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="candidate in candidateStatuses">
        <CandidateTableRow
          :key="candidate.name"
          :is-initial-alignment="isInitialAlignment"
          :allow-removal="allowRemoval"
          v-bind="getRowProps(candidate)"
          @input="$emit('input', $event)"
          @remove="$emit('remove', $event)"
        />
        <CandidateDeficitRow
          v-if="!isInitialAlignment && candidate.name === 'Warren'"
          :key="`${candidate.name}-viability`"
          :caucusers="candidate.caucusers"
        />
      </template>
    </tbody>
  </table>
</template>

<script>
import CandidateDeficitRow from '../components/CandidateDeficitRow';
import CandidateTableRow from '../components/CandidateTableRow';
import TieStatuses from '../constants/TieStatuses';

export default {
  components: { CandidateDeficitRow, CandidateTableRow },
  props: {
    alignmentFloors: {
      type: Object,
      default: () => ({}),
    },
    allowRemoval: {
      type: Boolean,
      default: true,
    },
    assignedCaucusers: {
      type: Number,
      default: 0,
    },
    assignedDelegates: {
      type: Number,
      default: 0,
    },
    candidateStatuses: {
      type: Array,
      required: true,
    },
    isInitialAlignment: {
      type: Boolean,
      default: true,
    },
    totalAttendees: {
      type: Number,
      default: 0,
    },
    totalDelegates: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    getAlignmentFloor(name) {
      return this.alignmentFloors[name] || 0;
    },
    getRowProps(candidate) {
      const { name: name, caucusers, delegates, tieStatus } = candidate;
      const floor = this.getAlignmentFloor(name);
      return {
        caucusers,
        delegates,
        floor,
        name,
        tied: tieStatus === TieStatuses.UNRESOLVED,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.table-header {
  @apply align-top bg-white font-normal relative py-2 sticky;
  top: 71px; // More or less the height of the main header bar
  z-index: 1;
}

.table-header::after {
  @apply absolute bg-navy block bottom-0 inset-x-0;
  content: '';
  height: 3px;
}

.table-header:first-of-type::after {
  left: 0.75rem;
}

.table-header:last-of-type::after {
  right: 0.75rem;
}
</style>
