import Align from './views/Align';
import CheckOut from './views/CheckOut';
import Help from './views/Help';
import Home from './views/Home';
import LogIn from './views/LogIn';
import Results from './views/Results';
import Review from './views/Review';
import Router from 'vue-router';
import Vue from 'vue';

Vue.use(Router);

// Normally we'd lazy load all these routes, but in the interests of
// prioritizing offline capability we're loading all views.
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior(to) {
    return to.hash
      ? {
          selector: to.hash,
        }
      : { x: 0, y: 0 };
  },
  routes: [
    {
      path: '/log-in',
      name: 'logIn',
      component: LogIn,
    },
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/align',
      name: 'align',
      component: Align,
      props: { isInitialAlignment: true },
    },
    {
      path: '/review',
      name: 'review',
      component: Review,
      props: { isInitialReview: true },
    },
    {
      path: '/realign',
      name: 'realign',
      component: Align,
    },
    {
      path: '/results',
      name: 'results',
      component: Results,
    },
    {
      path: '/final-review',
      name: 'finalReview',
      component: Review,
    },
    {
      path: '/check-out',
      name: 'checkOut',
      component: CheckOut,
    },
    {
      path: '/help',
      name: 'help',
      component: Help,
    },
  ],
});
