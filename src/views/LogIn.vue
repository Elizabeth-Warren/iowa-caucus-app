<template>
  <div
    class="bg-navy text-white flex flex-col min-h-screen justify-center items-center p-8 text-center"
  >
    <Logo class="mx-auto logo" />
    <div class="my-auto pt-8 pb-16">
      <h1 class="uppercase mb-4 font-bold font-wide text-xl">Welcome</h1>
      <p class="log-in-max-w mb-12 text-lg">
        Please enter your phone number and captain code to find your caucus.
      </p>
      <form
        class="text-left log-in-max-w"
        data-tracking="caucus-form-login"
        @submit.prevent="handleSubmit"
      >
        <BaseInput
          v-model="phone"
          class="mb-2"
          :class="{ 'text-brightRed': phoneError }"
          :label="phoneError ? phoneError : 'Phone number'"
          type="tel"
          name="tel"
          placeholder="(___) ___-____"
          required
        />
        <BaseInput
          v-model.trim="precinctId"
          class="mb-8"
          :class="{ 'text-brightRed': idError }"
          :label="idError ? idError : 'Captain code'"
          name="code"
          pattern="[0-9]*"
          required
        />
        <BaseButton class="block w-full mb-auto" level="secondary"
          >Start</BaseButton
        >
      </form>
    </div>
  </div>
</template>

<script>
import BaseButton from '../components/BaseButton';
import BaseInput from '../components/BaseInput';
import Logo from '../assets/logo.svg';
import get from 'lodash/get';
import { mapActions } from 'vuex';

export default {
  name: 'LogIn',
  components: { BaseButton, BaseInput, Logo },
  data() {
    return {
      precinctId: get(this, '$store.state.precinctId', ''),
      phone: get(this, '$store.state.userPhone', ''),
      idError: null,
      phoneError: null,
    };
  },
  methods: {
    ...mapActions(['fetchPrecinctData', 'setPhone', 'submitReporting']),
    async handleSubmit() {
      this.phoneError = null;
      this.idError = null;
      try {
        this.setPhone(this.phone);
      } catch (err) {
        this.phoneError = err.message;
      }
      try {
        await this.fetchPrecinctData(this.precinctId);
      } catch (err) {
        this.idError = err.message;
      }
      if (this.idError || this.phoneError) {
        return;
      }
      this.submitReporting({
        event_type: 'login',
      });
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.log-in-max-w {
  max-width: 280px;
  width: 100%;
}

.logo {
  width: 110px;
}
</style>
