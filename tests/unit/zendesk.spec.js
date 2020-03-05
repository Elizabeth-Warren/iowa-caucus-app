import mockAxios from 'jest-mock-axios';
import zendesk from '../../src/services/zendesk';

const unindent = (s) => s.replace(/^ +/gm, '');

afterEach(() => {
  // cleanup up the axios mock
  mockAxios.reset();
});

it('Sends API requests to toes', async () => {
  const promise = zendesk.createSupportTicket({
    precinctId: '12345',
    phoneNumber: '1234567890',
    problem: 'Location is locked',
    message: 'Help please!',
    createdAt: new Date(2020, 1, 10, 5, 28, 23),
  });

  expect(mockAxios.post).toHaveBeenCalledTimes(1);
  expect(mockAxios.post).toHaveBeenCalledWith('/submit_ticket', {
    requester_name: 'Precinct 12345 captain (123-456-7890)',
    phone_number: '11234567890',
    title: 'Help Request from precinct 12345: Location is locked',
    precinct_id: '12345',
    body: unindent(`
      Help request submitted via caucus app: Location is locked
      
      Submitted at: Mon Feb 10 2020 05:28:23 GMT+0000 (Coordinated Universal Time)
      
      Message from precinct captain (123-456-7890):
      
      Help please!
    `),
  });

  mockAxios.mockResponse();

  return expect(promise).resolves.toBeTruthy();
});

it('Sends api requests to zendesk if toes fails', async () => {
  const promise = zendesk.createSupportTicket({
    precinctId: '12345',
    phoneNumber: '1234567890',
    problem: 'Location is locked',
    message: 'Help please!',
    createdAt: new Date(2020, 1, 10, 5, 28, 23),
  });

  mockAxios.mockError();
  mockAxios.mockResponse();

  expect(mockAxios.post).toHaveBeenCalledTimes(2);
  expect(mockAxios.post).toHaveBeenCalledWith('/api/v2/requests.json', {
    request: {
      requester: { name: 'Anonymous Precinct Captain' },
      subject: 'Help Request from precinct 12345: Location is locked',
      comment: {
        body: unindent(`
          Help request submitted via caucus app: Location is locked

          Unable to set up Zendesk call-back automatically; copy-paste the precinct captain's phone into the Zendesk dialer: 123-456-7890
          
          Submitted at: Mon Feb 10 2020 05:28:23 GMT+0000 (Coordinated Universal Time)
          
          Message from precinct captain:
          
          Help please!
        `),
      },
    },
  });

  return expect(promise).resolves.toBeTruthy();
});

it('Propagates the error if both options fail', async () => {
  const promise = zendesk.createSupportTicket({
    precinctId: '12345',
    phoneNumber: '1234567890',
    problem: 'Location is locked',
    message: 'Help please!',
    createdAt: new Date(2020, 1, 10, 5, 28, 23),
  });

  mockAxios.mockError();
  mockAxios.mockError();

  return expect(promise).rejects.toBeTruthy();
});
