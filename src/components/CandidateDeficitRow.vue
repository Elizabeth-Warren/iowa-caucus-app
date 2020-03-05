<template>
  <tr v-if="deficit > 0">
    <td colspan="3" class="bg-liberty px-4 py-3">
      We need <b>{{ deficit }}</b> more attendee{{ deficit !== 1 ? 's' : '' }}
      to be viable!
    </td>
  </tr>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  props: {
    caucusers: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapGetters(['viabilityThreshold']),
    ...mapState(['totalAttendees']),
    deficit() {
      const threshold =
        this.viabilityThreshold === 'simple majority'
          ? Math.floor(this.totalAttendees / 2) + 1
          : this.viabilityThreshold;
      return threshold - this.caucusers;
    },
  },
};
</script>

<style lang="scss" scoped></style>
