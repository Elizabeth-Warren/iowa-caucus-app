<template>
  <TheViewContainer>
    <TheHeader level="secondary">Help</TheHeader>
    <TheBody class="mb-2" level="secondary">
      <form
        v-if="activeProblem"
        data-tracking="caucus-form-help"
        @submit.prevent="handleSubmit"
      >
        <ContentBlock class="mb-2">
          <h2 class="text-lg mb-2">{{ activeProblem }}</h2>
          <div v-if="!isOnline" class="bg-yellow p-4 mb-2">
            You are currently offline. Any messages you submit will be sent when
            you are back online. For immediate assistance please call
            <a @href="`tel:+1-${process.env.VUE_APP_HOTLINE_NUMBER}`" class="whitespace-no-wrap underline"
              >515-375-7979</a
            >
            directly.
          </div>
          <label>
            <div class="mb-2 type-sm">Enter your message here</div>
            <textarea
              v-model.trim="description"
              class="block border-2 border-navy w-full h-64 p-2"
            />
          </label>
        </ContentBlock>
        <BaseButton :disabled="isBusy || !description">{{
          isBusy ? 'Loading' : 'Send message'
        }}</BaseButton>
      </form>
      <div v-else>
        <router-link
          class="block bg-white mb-1 px-4 py-6 text-lg tracking-tight"
          to="/results"
        >
          Break down caucus math<ChevronIcon class="border-red ml-1" />
        </router-link>
        <a
          v-for="(problem, i) in problems"
          :key="problem"
          :href="`#help-${i}`"
          class="block bg-white mb-1 px-4 py-6 text-lg tracking-tight"
        >
          {{ problem }}<ChevronIcon class="border-red ml-1" />
        </a>
        <button
          key="reset"
          class="block bg-red mb-1 px-4 py-6 text-lg text-left text-white tracking-tight w-full"
          @click="isShowingResetModal = true"
        >
          Reset app<ChevronIcon class="border-white ml-1" />
        </button>
      </div>
    </TheBody>
    <a
      v-if="!activeProblem"
      href="tel:+1-515-375-7979"
      class="bg-liberty block sticky font-bold inset-x-0 bottom-0 mt-auto p-3 text-center"
      data-tracking="caucus-button-call"
    >
      Call for help
    </a>
    <ResetAppModal
      v-if="isShowingResetModal"
      data-tracking="caucus-button-reset"
      @close="isShowingResetModal = false"
    />
  </TheViewContainer>
</template>

<script>
import BaseButton from '../components/BaseButton';
import ChevronIcon from '../components/ChevronIcon';
import ContentBlock from '../components/ContentBlock';
import NotificationTypes from '../constants/NotificationTypes';
import ResetAppModal from '../components/ResetAppModal';
import TheBody from '../components/TheBody';
import TheHeader from '../components/TheHeader';
import TheViewContainer from '../components/TheViewContainer';
import isInteger from 'lodash/isInteger';
import problems from '../constants/problems';
import { mapActions, mapState } from 'vuex';

export default {
  components: {
    BaseButton,
    ChevronIcon,
    ContentBlock,
    ResetAppModal,
    TheBody,
    TheHeader,
    TheViewContainer,
  },
  data() {
    return {
      isBusy: false,
      isShowingResetModal: false,
      problems,
      description: '',
    };
  },
  computed: {
    ...mapState(['isOnline', 'userPhone', 'precinctId']),
    activeProblem() {
      const idx = parseInt(this.$route.hash.split('-')[1], 10);
      return isInteger(idx) ? this.problems[idx] : null;
    },
  },
  watch: {
    activeProblem() {
      this.description = '';
      this.$nextTick(() => {
        window.scrollTo(0, 0);
      });
    },
  },
  methods: {
    ...mapActions(['showToast', 'submitHelpRequest']),
    async handleSubmit() {
      if (this.isBusy || !this.description) {
        return;
      }
      this.isBusy = true;
      try {
        await this.submitHelpRequest({
          problem: this.activeProblem,
          createdAt: new Date(),
          message: this.description,
          phoneNumber: this.userPhone,
          precinctId: this.precinctId,
        });
        this.description = '';
        this.showToast({ message: 'Your message has been submitted.' });
      } catch ({ name, message }) {
        this.showToast({
          message:
            `There was an error sending your message. If this problem continues try calling <a href="tel:+1-${process.env.VUE_APP_HOTLINE_NUMBER}" class="whitespace-no-wrap underline">${process.env.VUE_APP_HOTLINE_NUMBER}</a> directly.`,
          type: NotificationTypes.WARNING,
          dismissAfter: 0,
        });
      } finally {
        this.isBusy = false;
      }
    },
  },
};
</script>
