/* eslint-disable no-console */

import NotificationTypes from './constants/NotificationTypes';
import TieStatuses from './constants/TieStatuses';
import Vue from 'vue';
import Vuex from 'vuex';
import api from './services/api';
import baseCandidates from './constants/candidates';
import createPersistedState from 'vuex-persistedstate';
import fetchPrecinct from './services/fetchPrecinct';
import getViabilityThreshold from './util/getViabilityThreshold';
import isEqual from 'lodash/isEqual';
import isInteger from 'lodash/isInteger';
import mapCandidateStatuses from './util/mapCandidateStatuses';
import omit from 'lodash/omit';
import shortid from 'shortid';
import sum from 'lodash/sum';
import sumBy from 'lodash/sumBy';
import unionBy from 'lodash/unionBy';
import uniqWith from 'lodash/uniqWith';
import unregisterServiceWorkers from './util/unregisterServiceWorkers';
import upload from './services/upload';
import wait from './util/wait';
import zendesk from './services/zendesk';
import './util/typedef';
import validateNewCandidate from './util/validateNewCandidate';

Vue.use(Vuex);

const mutations = Object.freeze({
  ADD_CANDIDATE: 'ADD_CANDIDATE',
  ADD_TOAST: 'ADD_TOAST',
  QUEUE_ACTION: 'QUEUE_ACTION',
  REMOVE_CANDIDATE: 'REMOVE_CANDIDATE',
  REMOVE_TOAST: 'REMOVE_TOAST',
  RESET_APP: 'RESET_APP',
  RESET_CAUCUS: 'RESET_CAUCUS',
  SET_ALIGNMENT_FLOORS: 'SET_ALIGNMENT_FLOORS',
  SET_CAUCUSER_COUNT: 'SET_CAUCUSER_COUNT',
  SET_FINAL_RESULTS: 'SET_FINAL_RESULTS',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_PHONE: 'SET_PHONE',
  SET_PRECINCT: 'SET_PRECINCT',
  SET_PRECINCT_ID: 'SET_PRECINCT_ID',
  SET_QUEUE: 'SET_QUEUE',
  SET_SEEN_TEXT_PROMPT: 'SET_SEEN_TEXT_PROMPT',
  SET_TOTAL_ATTENDEES: 'SET_TOTAL_ATTENDEES',
});

const isValidCount = (count) => isInteger(count) && count >= 0;
const isValidCandidate = (candidates, name) => candidates.includes(name);
const isValidPhone = (phone) => phone.length === 10;

class OfflineError extends Error {
  constructor() {
    super();
    this.name = 'OfflineError';
    this.message =
      'You are currently offline. This message will be sent when you are reconnected.';
  }
}

const getInitialCaucuserCount = () =>
  baseCandidates.reduce((obj, key) => {
    obj[key] = 0;
    return obj;
  }, {});

const getInitialState = () => ({
  /**
   * @prop {Object} - After realignment, a map of the minimum number of
   * caucusers a candidate should receive.
   */
  alignmentFloors: {},
  /**
   * @prop {CaucuserMap} - Actual map of caucusers assigned to candidates.
   */
  caucuserCount: getInitialCaucuserCount(),
  /** @prop {Array<string>} - All the base and custom added candidates. */
  candidates: [...baseCandidates],
  /** @prop {?Precinct} - Precinct data */
  precinct: null,
  /** @prop {?string} - Precinct ID */
  precinctId: null,
  /**
   * @prop {Array<CandidateStatus>} - the final results of the caucus. This
   * will likely be a snapshot of `getters.candidateStatuses` unless there was
   * a tie at which point the user will need to manually pick tie breakers
   * which will result in adjusted delegate numbers.
   */
  finalResults: [],
  /** @prop {number} - official count of caucus goers */
  totalAttendees: 0,
  /** @prop {string} - caucus captain's contact number */
  userPhone: '',
  /** @prop {boolean} - whether the user is online */
  isOnline: navigator.onLine,
  /**
   * @prop {Array<Object>} - array of post requests user made while offline
   * that will be submitted when they regain connectivity
   */
  postQueue: [],
  /** @prop {Array<string>} - temporary app notifications to display */
  toasts: [],
  /** @prop {Boolean} - Whether or not the user has seen a prompt to text the hotline. */
  seenTextPrompt: false,
});

export default new Vuex.Store({
  plugins: [
    createPersistedState({
      paths: [
        'alignmentFloors',
        'candidates',
        'caucuserCount',
        'finalResults',
        'postQueue',
        'precinct',
        'precinctId',
        'seenTextPrompt',
        'totalAttendees',
        'userPhone',
      ],
      key: 'caucus-v4',
    }),
  ],
  state: getInitialState(),
  mutations: {
    [mutations.ADD_CANDIDATE](state, name) {
      state.candidates = [...state.candidates, name];
    },
    [mutations.ADD_TOAST](state, payload) {
      const existingToast = state.toasts.find((item) => item.id === payload.id);
      if (!existingToast) {
        state.toasts = [...state.toasts, payload];
      }
    },
    [mutations.QUEUE_ACTION](state, data) {
      state.postQueue = [...state.postQueue, data];
    },
    [mutations.REMOVE_CANDIDATE](state, name) {
      state.candidates = state.candidates.filter(
        (candidate) => candidate !== name
      );
      state.caucuserCount = omit(state.caucuserCount, [name]);
    },
    [mutations.REMOVE_TOAST](state, id) {
      state.toasts = state.toasts.filter((item) => item.id !== id);
    },
    [mutations.RESET_APP](state) {
      Object.entries(getInitialState()).forEach(([key, value]) => {
        state[key] = value;
      });
    },
    [mutations.RESET_CAUCUS](state) {
      state.alignmentFloors = {};
      state.caucuserCount = getInitialCaucuserCount();
      state.candidates = [...baseCandidates];
      state.finalResults = [];
      state.totalAttendees = 0;
    },
    [mutations.SET_ALIGNMENT_FLOORS](state, payload) {
      state.alignmentFloors = payload;
    },
    [mutations.SET_FINAL_RESULTS](state, payload) {
      state.finalResults = payload;
    },
    [mutations.SET_PRECINCT](state, payload) {
      state.precinct = payload;
    },
    [mutations.SET_PRECINCT_ID](state, id) {
      state.precinctId = id;
    },
    [mutations.SET_SEEN_TEXT_PROMPT](state, val) {
      state.seenTextPrompt = val;
    },
    [mutations.SET_TOTAL_ATTENDEES](state, count) {
      state.totalAttendees = count;
    },
    [mutations.SET_CAUCUSER_COUNT](state, payload) {
      state.caucuserCount = { ...state.caucuserCount, ...payload };
    },
    [mutations.SET_PHONE](state, phone) {
      state.userPhone = phone;
    },
    [mutations.SET_ONLINE_STATUS](state, status) {
      state.isOnline = status;
    },
    [mutations.SET_QUEUE](state, queue) {
      state.postQueue = queue;
    },
  },
  actions: {
    async fetchPrecinctData({ commit, state }, precinctId) {
      const id = precinctId || state.precinctId;
      const data = await fetchPrecinct(id);
      if (!data) {
        throw new Error('Invalid code. Please try again.');
      }
      if (state.precinctId !== id) {
        // The precinct ID has changed. Reset the caucus and update precinct.
        commit(mutations.RESET_CAUCUS);
        commit(mutations.SET_PRECINCT_ID, id);
        commit(mutations.SET_PRECINCT, data);
      } else if (
        !state.precinct ||
        (state.precinct && data.updatedAt > state.precinct.updatedAt)
      ) {
        // If there is no existing precinct data, or the existing data is
        // stale, then update it with the new data.
        commit(mutations.SET_PRECINCT, data);
      } else {
        // The data we have in memory is more up-to-date. Commit the same data,
        // but marked as `fromCache`.
        commit(mutations.SET_PRECINCT, { ...state.precinct, fromCache: true });
      }
      return state.precinct;
    },
    setTotalAttendees({ commit }, count) {
      if (!isValidCount(count)) {
        throw new Error('Invalid number. Please try again.');
      }
      commit(mutations.SET_TOTAL_ATTENDEES, count);
    },
    setCaucuserCount({ commit, state }, { name, count }) {
      if (!isValidCandidate(state.candidates, name)) {
        throw new Error('Invalid candidate.');
      }
      if (!isValidCount(count)) {
        throw new Error('Invalid number');
      }
      commit(mutations.SET_CAUCUSER_COUNT, { [name]: count });
    },
    setFinalResults({ commit }, payload) {
      commit(mutations.SET_FINAL_RESULTS, payload);
    },
    setPhone({ commit }, phone) {
      if (!isValidPhone(phone)) {
        throw new Error('Please enter a valid phone number.');
      }
      commit(mutations.SET_PHONE, phone);
    },
    addCandidate(
      { dispatch, state, commit },
      { name: rawName, skipValidation = true }
    ) {
      if (!skipValidation) {
        validateNewCandidate(rawName, state.candidates);
      }

      const name = rawName.trim();
      commit(mutations.ADD_CANDIDATE, name);
      dispatch('setCaucuserCount', { name, count: 0 });
    },
    removeCandidate({ commit }, name) {
      commit(mutations.REMOVE_CANDIDATE, name);
    },
    removeToast({ commit }, id) {
      commit(mutations.REMOVE_TOAST, id);
    },
    showTextPrompt({ dispatch, commit, state }) {
      if (state.seenTextPrompt) return;
      dispatch('showToast', {
        message:
          `Welcome to the Caucus app! Text the hotline <a href="sms:+1-${process.env.VUE_APP_HOTLINE_NUMBER}" class="whitespace-no-wrap underline">(${process.env.VUE_APP_HOTLINE_NUMBER})</a> to introduce yourself so we can respond quickly on caucus night!`,
        type: NotificationTypes.WARNING,
        dismissAfter: 0,
      });
      commit(mutations.SET_SEEN_TEXT_PROMPT, true);
    },
    async runQueue({ commit, dispatch, state }) {
      const successes = [];
      try {
        await Promise.all(
          state.postQueue.map(async ({ action, payload }, idx) => {
            await dispatch(action, payload);
            successes.push(idx);
          })
        );
      } finally {
        const newQueue = state.postQueue.filter(
          (item, i) => !successes.includes(i)
        );
        commit(mutations.SET_QUEUE, newQueue);
      }
    },
    async showToast(
      { commit },
      {
        id: origId = null,
        message,
        type = NotificationTypes.DEFAULT,
        dismissAfter = 3000,
        actions = [],
      }
    ) {
      const id = origId || shortid.generate();
      commit(mutations.ADD_TOAST, { id, message, type, actions });
      if (!dismissAfter) {
        return;
      }
      await wait(dismissAfter);
      commit(mutations.REMOVE_TOAST, id);
    },
    async submitHelpRequest({ dispatch, state }, payload) {
      if (!state.isOnline) {
        dispatch('queueAction', { action: 'submitHelpRequest', payload });
        throw new OfflineError();
      }
      await zendesk.createSupportTicket(payload);
    },
    async uploadPhoto({ dispatch, state }, payload) {
      if (!state.isOnline) {
        dispatch('queueAction', { action: 'uploadPhoto', payload });
        throw new OfflineError();
      }
      if (process.env.NODE_ENV === 'production') {
        try {
          return upload(payload);
        } catch (err) {
          if (err.message === 'Network Error') {
            dispatch('queueAction', { action: 'uploadPhoto', payload });
            throw new OfflineError();
          } else {
            throw err;
          }
        }
      } else {
        await 1000;
        return {};
      }
    },
    async submitReporting({ dispatch, state }, payload) {
      const finalPayload = {
        // same as `new Date()`, but easier to mock out
        created_at: new Date(Date.now()),
        phone_number: state.userPhone,
        precinct_id: state.precinctId,
        attendee_count: state.totalAttendees,
        ...payload,
      };
      if (process.env.VUE_APP_VERSION) {
        finalPayload.version = process.env.VUE_APP_VERSION;
      }
      if (!state.isOnline) {
        dispatch('queueAction', {
          action: 'submitReporting',
          payload: finalPayload,
        });
        throw new OfflineError();
      }
      if (process.env.NODE_ENV === 'production') {
        try {
          await api.post('/result', finalPayload);
        } catch (err) {
          if (err.message === 'Network Error') {
            dispatch('queueAction', {
              action: 'submitReporting',
              payload: finalPayload,
            });
            throw new OfflineError();
          } else {
            throw err;
          }
        }
      } else {
        console.log('Not in production; not submitting', finalPayload);
        await wait(1000);
      }
    },
    queueAction({ commit, state }, { action, payload }) {
      const existingAction = state.postQueue.find(
        (item) => item.payload === payload
      );
      if (existingAction) {
        return;
      }
      const data = { action, payload };
      commit(mutations.QUEUE_ACTION, data);
    },
    setAlignmentFloors({ getters, commit }) {
      const alignmentFloors = getters.viableCandidates.reduce(
        (obj, candidate) => {
          const { name, caucusers } = candidate;
          obj[name] = caucusers;
          return obj;
        },
        {}
      );
      commit(mutations.SET_ALIGNMENT_FLOORS, alignmentFloors);
    },
    setOnLineStatus({ commit }, status) {
      commit(mutations.SET_ONLINE_STATUS, status);
    },
    async resetApp({ commit }) {
      try {
        await unregisterServiceWorkers();
      } finally {
        commit(mutations.RESET_APP);
        window.location.reload(true);
      }
    },
  },
  getters: {
    /** @returns {number} - total count of caucusers who have been assigned */
    assignedCaucusers: (state) => sum(Object.values(state.caucuserCount)),
    /** @returns {number} - total possible delegates for the precinct */
    totalDelegates: ({ precinct }) => (precinct ? precinct.delegates : 0),
    /** @returns {number} - total count of delegates that have been allocated */
    assignedDelegates: (state, getters) =>
      sumBy(getters.candidateStatuses, 'delegates'),
    /** @returns {Array<CandidateStatus>} */
    candidateStatuses: (state, { totalDelegates }) => {
      if (!state.precinct) {
        return [];
      }
      const { candidates, caucuserCount, totalAttendees } = state;
      return mapCandidateStatuses({
        names: candidates,
        caucuserCount,
        totalAttendees,
        totalDelegates,
      });
    },
    /**
     * Final results for all candidates, including non-viable candidates
     * @returns {Array<CandidateStatus>}
     */
    fullFinalResults: (state, getters) =>
      unionBy(state.finalResults, getters.candidateStatuses, 'name'),
    /**
     * Pending ties that must be resolved before final review.
     * @returns {Array<Array<string>>}
     */
    pendingTies: (state) => {
      const result = uniqWith(
        state.finalResults
          .filter(
            (candidate) =>
              !!candidate.ties.length &&
              candidate.tieStatus === TieStatuses.UNRESOLVED
          )
          .map((candidate) => [candidate.name, ...candidate.ties]),
        (a, b) => isEqual([...a].sort(), [...b].sort())
      );
      return result;
    },
    /**
     * @returns {Array<CandidateStatus>} - Candidates that have received any
     *  number of delegates
     */
    viableCandidates: (state, getters) =>
      getters.candidateStatuses.filter((candidate) => candidate.delegates),
    /**
     * @returns {number|string} - Number of caucus goers required for a
     *  candidate to be viable (receive at least one delegate)
     */
    viabilityThreshold: ({ precinct, totalAttendees }) =>
      precinct && precinct.delegates > 1
        ? getViabilityThreshold(totalAttendees, precinct.delegates)
        : 'simple majority',
  },
});
