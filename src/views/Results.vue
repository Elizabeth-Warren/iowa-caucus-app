<template>
  <TheViewContainer>
    <TheHeader level="secondary">Results</TheHeader>
    <TheBody class="mb-2" level="secondary">
      <div v-if="!candidates.length" class="content-row text-lg">
        Start the caucus to see the caucus math breakdown.
      </div>
      <div v-else class="content-row">
        <h2 class="text-lg">Results of this caucus</h2>
      </div>
      <div
        v-for="item in candidates"
        :key="item.candidateName"
        class="content-row"
      >
        <h3 class="font-bold">{{ item.name }}</h3>
        <div class="flex justify-between">
          <span title="Assigned caucusergoers">{{ item.caucusers }}</span>
          <b>&divide;</b>
          <span title="Total attendance">{{ totalAttendees }}</span>
          <b>&times;</b>
          <span title="Total delegates">{{ totalDelegates }}</span>
          <b>=</b>
          <span title="Raw delegate count">
            {{ parseFloat(item.rawDelegates.toFixed(3)) }}
          </span>
          <b title="Rounding">
            {{ getRoundingSymbol(item.rawDelegates, item.delegates) }}
          </b>
          <span
            title="Delegates"
            :class="
              (item.tieStatus === TieStatuses.WON ||
                item.tieStatus === TieStatuses.LOST) &&
                'text-red'
            "
          >
            {{ item.delegates }}
            {{
              item.tieStatus === TieStatuses.WON ||
              item.tieStatus === TieStatuses.LOST
                ? '*'
                : ''
            }}
          </span>
        </div>
        <div v-if="item.tieStatus === TieStatuses.WON" class="text-red">
          * won a tie
        </div>
        <div v-if="item.tieStatus === TieStatuses.LOST" class="text-red">
          * lost a tie
        </div>
      </div>
    </TheBody>
  </TheViewContainer>
</template>

<script>
import TheBody from '../components/TheBody';
import TheHeader from '../components/TheHeader';
import TheViewContainer from '../components/TheViewContainer';
import TieStatuses from '../constants/TieStatuses';
import { mapGetters, mapState } from 'vuex';

export default {
  components: {
    TheBody,
    TheHeader,
    TheViewContainer,
  },
  data() {
    return { TieStatuses };
  },
  computed: {
    ...mapState(['finalResults', 'totalAttendees']),
    ...mapGetters(['assignedCaucusers', 'totalDelegates', 'viableCandidates']),
    candidates() {
      return this.finalResults.length
        ? this.finalResults
        : this.viableCandidates;
    },
  },
  methods: {
    getRoundingSymbol(rawDelegates, delegates) {
      if (rawDelegates < delegates) {
        return '↑';
      }
      if (rawDelegates > delegates) {
        return '↓';
      } else {
        return '~';
      }
    },
  },
};
</script>

<style scoped>
.content-row {
  @apply bg-white mb-1 px-4 py-6;
}
</style>
