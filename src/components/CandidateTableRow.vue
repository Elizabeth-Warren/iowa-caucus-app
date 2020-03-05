<template>
  <tr
    class="border-t-3 border-offWhite font-bold first:border-t-0"
    :class="{
      'text-red': floor > caucusers,
      'opacity-75': !delegates && !isInitialAlignment && name !== 'Warren',
    }"
    :data-test="`alignment-row-${name.toLowerCase()}`"
  >
    <td class="bg-white pl-2 sm:pl-3 py-4 name-column">
      <div class="flex items-center">
        <button
          class="font-bold text-lg mr-auto"
          @click="$emit('remove', name)"
        >
          &times;
        </button>
        <div class="candidate-content ml-auto leading-tight">
          <span class="sm:text-lg tracking-tight">{{ name }}</span>
          <div v-if="!delegates" class="font-normal text-sm">
            Not viable
          </div>
          <div v-if="floor > caucusers" class="font-normal text-sm">
            Below initial alignment
          </div>
          <div v-if="tied" class="font-normal text-sm text-red">
            Tied
          </div>
        </div>
      </div>
    </td>
    <td class="py-4 text-center">
      <DelegateCount
        :delegates="delegates"
        :invalid="floor > caucusers"
        :tied="tied"
      />
    </td>
    <td class="pr-2 sm:pr-3 py-4 text-right">
      <CaucuserCounter
        :value="caucusers"
        @input="$emit('input', { name, value: $event })"
      />
    </td>
  </tr>
</template>

<script>
import CaucuserCounter from '../components/CaucuserCounter';
import DelegateCount from '../components/DelegateCount';

export default {
  components: { CaucuserCounter, DelegateCount },
  props: {
    allowRemoval: {
      type: Boolean,
      default: true,
    },
    floor: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: true,
    },
    caucusers: {
      type: Number,
      default: 0,
    },
    delegates: {
      type: Number,
      default: 0,
    },
    customCandidate: {
      type: Boolean,
      default: false,
    },
    tied: {
      type: Boolean,
      default: false,
    },
    isInitialAlignment: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.name-column {
  max-width: 33vw;

  @media screen and (min-width: 480px) {
    max-width: none;
  }
}

.candidate-content {
  overflow: hidden;
  text-overflow: ellipsis;
  width: calc(100% - 20px);
}
</style>
