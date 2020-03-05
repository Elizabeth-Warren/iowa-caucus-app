<template>
  <TheViewContainer>
    <TheHeader :show-back-button="false">Welcome</TheHeader>
    <TheBody>
      <ContentBlock v-if="precinct" class="mb-4">
        <p class="font-bold text-lg mb-4">Hey, Captain!</p>
        <p class="mb-4 text-lg">
          The caucus in {{ county }} County ({{ precinct.code }}) is on 02/03/20
          at 7pm.
        </p>
        <p class="mb-4">
          There {{ precinct.delegates === 1 ? 'is' : 'are' }}
          <b
            >{{ precinct.delegates }}
            {{ precinct.delegates === 1 ? 'delegate' : 'delegates' }}</b
          >
          available.
        </p>
        <address class="font-bold not-italic">
          {{ precinct.location.name }}<br />
          {{ address }}
        </address>
        <p class="mb-2">
          <em>Last updated {{ timeSinceUpdate }} ago.</em>{{ ' ' }}
          <button
            class="italic underline"
            type="button"
            :disabled="isBusy"
            @click="handleRefresh"
          >
            {{ isBusy ? 'Loading' : 'Refresh?' }}
          </button>
        </p>
        <p>
          <a :href="directionsLink" target="_blank">
            <StaticMap class="mb-2" :address="address" />
            <div class="text-center">Tap map for directions</div>
          </a>
        </p></ContentBlock
      >

      <router-link
        to="/log-in"
        class="block mb-4 text-center"
        level="tertiary"
        data-test="change-precinct"
      >
        Not your precinct? Switch precincts
        <ChevronIcon class="border-red" />
      </router-link>
      <BaseButton
        tag="router-link"
        to="/align"
        class="mb-2"
        data-test="submit"
        data-tracking="caucus-button-start"
      >
        Start the caucus
      </BaseButton>
    </TheBody>
    <StickyHelpButton />
  </TheViewContainer>
</template>

<script>
import BaseButton from '../components/BaseButton';
import ChevronIcon from '../components/ChevronIcon';
import ContentBlock from '../components/ContentBlock';
import NotificationTypes from '../constants/NotificationTypes';
import StaticMap from '../components/StaticMap';
import StickyHelpButton from '../components/StickyHelpButton';
import TheBody from '../components/TheBody';
import TheHeader from '../components/TheHeader';
import TheViewContainer from '../components/TheViewContainer';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import titleCase from 'lodash/startCase';
import toLower from 'lodash/toLower';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'Home',
  components: {
    BaseButton,
    ChevronIcon,
    ContentBlock,
    StaticMap,
    StickyHelpButton,
    TheBody,
    TheHeader,
    TheViewContainer,
  },
  data() {
    return { isBusy: false };
  },
  computed: {
    ...mapState(['precinct']),
    county() {
      if (!this.precinct) {
        return '';
      }
      return titleCase(toLower(this.precinct.county));
    },
    address() {
      if (!this.precinct) {
        return '';
      }
      const { address, city, state, zip } = this.precinct.location;
      return `${address}, ${city}, ${state} ${zip}`;
    },
    directionsLink() {
      return `https://www.google.com/maps/dir//${encodeURIComponent(
        this.address
      )}`;
    },
    timeSinceUpdate() {
      return formatDistanceToNow(new Date(this.precinct.updatedAt));
    },
  },
  watch: {
    precinct: {
      handler(newValue) {
        if (!newValue) return;
        this.toggleWarning();
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions(['fetchPrecinctData', 'showToast', 'removeToast']),
    async handleRefresh() {
      if (this.isBusy) {
        return;
      }
      this.isBusy = true;
      await this.fetchPrecinctData();
      this.isBusy = false;
    },
    toggleWarning() {
      const toastId = 'stale-data';
      if (this.precinct.fromCache) {
        this.showToast({
          id: toastId,
          message:
            'There was a problem retrieving the latest precinct data. Make sure that your location is correct.',
          type: NotificationTypes.WARNING,
          dismissAfter: 0,
        });
      } else {
        this.removeToast(toastId);
      }
    },
  },
};
</script>
