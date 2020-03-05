<template>
  <TheViewContainer tag="form" @submit.prevent="handleSubmit">
    <TheHeader>Check out</TheHeader>
    <TheBody>
      <form
        ref="form"
        data-test="check-out-form"
        data-tracking="caucus-form-check-out"
        @submit.prevent="handleSubmit"
      >
        <ContentBlock class="mb-3">
          <p class="text-lg mb-4">
            Please take a photo of your caucus form to submit.
          </p>
          <BaseButton tag="label" level="secondary">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="visuallyhidden"
              data-tracking="caucus-photo-attach"
              @change="handlePhotoChange"
            />
            {{ isPhotoAttached ? '✓ Attached' : 'Attach picture' }}
          </BaseButton>
        </ContentBlock>
        <ContentBlock class="mb-3">
          <h2 class="text-lg mb-2 tracking-tight">
            Have any thoughts to share?
          </h2>
          <label>
            <div class="mb-2 type-sm">Enter your message for us here</div>
            <textarea
              v-model="description"
              class="block border-2 border-navy mb-3 w-full h-32 p-2"
              placeholder="optional"
            />
          </label>
        </ContentBlock>
        <BaseButton data-test="submit" :disabled="isBusy" class="mb-3">
          {{ isBusy ? 'Loading' : 'Submit caucus results' }}
        </BaseButton>
      </form>
    </TheBody>
    <StickyHelpButton />
  </TheViewContainer>
</template>

<script>
import BaseButton from '../components/BaseButton';
import ContentBlock from '../components/ContentBlock';
import NotificationTypes from '../constants/NotificationTypes';
import StickyHelpButton from '../components/StickyHelpButton';
import TheBody from '../components/TheBody';
import TheHeader from '../components/TheHeader';
import TheViewContainer from '../components/TheViewContainer';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'CheckOut',
  components: {
    BaseButton,
    ContentBlock,
    StickyHelpButton,
    TheBody,
    TheHeader,
    TheViewContainer,
  },
  data() {
    return { description: '', isBusy: false, isPhotoAttached: false };
  },
  computed: {
    ...mapState(['totalAttendees', 'finalResults', 'precinctId', 'userPhone']),
    ...mapGetters(['fullFinalResults']),
  },
  methods: {
    ...mapActions(['showToast', 'submitReporting', 'uploadPhoto']),
    handlePhotoChange(e) {
      this.isPhotoAttached = !!e.target.value;
    },
    async handleSubmit() {
      if (this.isBusy) {
        return;
      }
      this.isBusy = true;
      try {
        const phone_number = this.userPhone;
        const precinct_id = this.precinctId;
        const reportingPayload = {
          event_type: 'final',
          notes: this.description,
        };
        if (this.isPhotoAttached) {
          const { s3_object_key } = await this.uploadPhoto({
            file: this.$refs.fileInput.files[0],
            phone_number,
            precinct_id,
          });
          reportingPayload.s3_object_key = s3_object_key;
        }
        await this.submitReporting(reportingPayload);
        this.resetForm();
        this.showToast({
          message: 'Thank you! Your caucus results have been submitted.',
        });
        this.$router.push('/log-in');
      } catch ({ name, message }) {
        this.showToast({ message, type: NotificationTypes.WARNING });
        if (name === 'OfflineError') {
          this.resetForm();
        }
      } finally {
        this.isBusy = false;
      }
    },
    resetForm() {
      this.description = '';
      this.isPhotoAttached = false;
      this.$refs.form.reset();
    },
  },
};
</script>
