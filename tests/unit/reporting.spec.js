jest.mock('../../src/services/api');

import api from '../../src/services/api';

const origNodeEnv = process.env.NODE_ENV;
const mockNow = new Date('2019-05-14T11:01:58.135Z');
const mockLater = new Date('2019-05-15T11:01:58.135Z');

beforeEach(() => {
  process.env.NODE_ENV = 'production';
  global.Date.now = jest.fn();
  global.Date.now.mockReturnValue(mockNow.getTime());
});

afterEach(() => {
  api.post.mockReset();
  process.env.NODE_ENV = origNodeEnv;
});

describe('store reporting', () => {
  let store;
  beforeEach(async () => {
    // we do this import in the beforeEach so we get a clean store
    // for every test
    store = require('../../src/store').default;

    store.dispatch('setTotalAttendees', 10);
    store.dispatch('setPhone', '5556667777');
    store.state.precinctId = '12345';
  });

  it('submits reports', () => {
    store.dispatch('submitReporting', {
      foo: '10',
      bar: '20',
    });

    expect(api.post).toHaveBeenCalledWith('/result', {
      attendee_count: 10,
      created_at: mockNow,
      phone_number: '5556667777',
      precinct_id: '12345',
      version: 'undefined',

      foo: '10',
      bar: '20',
    });
  });

  it('queues reports when offline', async () => {
    store.dispatch('setOnLineStatus', false);

    await expect(
      store.dispatch('submitReporting', {
        foo: '10',
        bar: '20',
      })
    ).rejects.toThrow(
      'You are currently offline. This message will be sent when you are reconnected'
    );

    expect(api.post).not.toHaveBeenCalled();

    // Advance the clock
    global.Date.now.mockReturnValue(mockLater.getTime());

    store.dispatch('setOnLineStatus', true);

    await store.dispatch('runQueue');
    expect(api.post).toHaveBeenCalledWith('/result', {
      attendee_count: 10,
      created_at: mockNow,
      phone_number: '5556667777',
      precinct_id: '12345',
      version: 'undefined',

      foo: '10',
      bar: '20',
    });
  });

  it('queues reports if there is a network error', async () => {
    const networkError = new Error('Network Error');
    api.post.mockReturnValue(Promise.reject(networkError));

    await expect(
      store.dispatch('submitReporting', {
        foo: '10',
        bar: '20',
      })
    ).rejects.toThrow(
      'You are currently offline. This message will be sent when you are reconnected'
    );

    api.post.mockReset();

    // Advance the clock
    global.Date.now.mockReturnValue(mockLater.getTime());

    await store.dispatch('runQueue');
    expect(api.post).toHaveBeenCalledWith('/result', {
      attendee_count: 10,
      created_at: mockNow,
      phone_number: '5556667777',
      precinct_id: '12345',
      version: 'undefined',

      foo: '10',
      bar: '20',
    });
  });
});
