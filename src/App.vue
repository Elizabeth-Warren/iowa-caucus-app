<template>
  <div id="app" class="bg-offWhite">
    <ToastContainer :items="toasts" @close="removeToast($event)" />
    <div class="flex flex-col min-h-screen">
      <router-view />
    </div>
    <portal-target name="modal" />
  </div>
</template>

<script>
import NotificationTypes from './constants/NotificationTypes';
import ToastContainer from './components/ToastContainer';
import { mapActions, mapState } from 'vuex';

export default {
  components: { ToastContainer },
  data() {
    return {
      refreshing: false,
      registration: null,
      updateExists: false,
    };
  },
  computed: {
    ...mapState(['isOnline', 'precinctId', 'toasts', 'userPhone']),
  },
  watch: {
    precinctId: {
      handler(newValue) {
        if (!newValue && this.$route.name !== 'logIn') {
          this.$router.push('/log-in');
        }
        if (newValue) {
          this.showTextPrompt();
        }
      },
      immediate: true,
    },
    isOnline: {
      handler(newValue) {
        const id = 'offline';
        if (newValue) {
          this.removeToast(id);
          this.runQueue();
        } else {
          this.showToast({
            id,
            message:
              'You are currently offline. You can still use the app. ' +
              'Any form posts or help requests will be submitted when you are ' +
              'back online.',
            type: NotificationTypes.WARNING,
            dismissAfter: 0,
          });
        }
      },
      immediate: true,
    },
    userPhone: {
      handler(newValue) {
        if (!window.heap) {
          return;
        }
        if (newValue) {
          window.heap.identify(`caucus-app-${newValue}`);
        } else {
          window.heap.resetIdentity();
        }
      },
      immediate: true,
    },
    updateExists(newValue) {
      const id = 'outdated';
      if (newValue) {
        this.showToast({
          id,
          message: 'A new version of the app is available.',
          type: NotificationTypes.WARNING,
          actions: [
            {
              label: 'Refresh',
              handler: this.refreshApp,
            },
          ],
          dismissAfter: 0,
        });
      } else {
        this.removeToast(id);
      }
    },
  },
  created() {
    if (this.precinctId) {
      this.fetchPrecinctData(this.precinctId);
    }
    if ('serviceWorker' in navigator) {
      document.addEventListener('swUpdated', this.showRefresh, {
        once: true,
      });
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        this.handleControllerChange
      );
    }
  },
  mounted() {
    window.addEventListener('online', this.updateOnLineStatus);
    window.addEventListener('offline', this.updateOnLineStatus);
  },
  beforeDestroy() {
    window.removeEventListener('online', this.updateOnLineStatus);
    window.removeEventListener('offline', this.updateOnLineStatus);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        this.handleControllerChange
      );
    }
  },
  methods: {
    ...mapActions([
      'fetchPrecinctData',
      'removeToast',
      'runQueue',
      'setOnLineStatus',
      'showTextPrompt',
      'showToast',
    ]),
    handleControllerChange() {
      if (this.refreshing) return;
      this.refreshing = true;
      window.location.reload(true);
    },
    updateOnLineStatus(e) {
      this.setOnLineStatus(e.type === 'online');
    },
    showRefresh(e) {
      this.registration = e.detail;
      this.updateExists = true;
    },
    refreshApp() {
      this.updateExists = false;
      if (!this.registration || !this.registration.waiting) return;
      this.registration.waiting.postMessage('skipWaiting');
    },
  },
};
</script>

<style lang="scss">
@import 'assets/styles/tailwind.postcss';

html,
body {
  @apply font-sans leading-tight text-navy;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100%;
}

.visuallyhidden {
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.visuallyhidden.focusable:active,
.visuallyhidden.focusable:focus {
  clip: auto;
  clip-path: none;
  height: auto;
  margin: 0;
  overflow: visible;
  position: static;
  white-space: inherit;
  width: auto;
}
</style>
