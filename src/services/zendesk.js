/* eslint-disable no-console */

import api from './api';
import axios from 'axios';
import wait from '../util/wait';

let zendeskAPI;
if (process.env.VUE_APP_ZENDESK_URL) {
  zendeskAPI = axios.create({
    baseURL: process.env.VUE_APP_ZENDESK_URL,
    timeout: 10000,
  });
}

const ticketRequester = ({ precinctId, formattedPhone }) =>
  `Precinct ${precinctId} captain (${formattedPhone})`;

const ticketSubject = ({ precinctId, problem }) =>
  `Help Request from precinct ${precinctId}: ${problem}`;

const ticketBody = ({ problem, createdAt, formattedPhone, message }) => `
Help request submitted via caucus app: ${problem}

Submitted at: ${createdAt}

Message from precinct captain (${formattedPhone}):

${message}
`;

const ticketBackupBody = ({ problem, createdAt, formattedPhone, message }) => `
Help request submitted via caucus app: ${problem}

Unable to set up Zendesk call-back automatically; copy-paste the precinct captain's phone into the Zendesk dialer: ${formattedPhone}

Submitted at: ${createdAt}

Message from precinct captain:

${message}
`;

export default {
  createSupportTicket({
    precinctId,
    phoneNumber,
    problem,
    message,
    createdAt,
  }) {
    if (!process.env.VUE_APP_ZENDESK_URL) {
      console.log('No VUE_APP_ZENDESK_URL; not sending Zendesk request');
      return wait(1000);
    }

    const formattedPhone = [
      phoneNumber.slice(0, 3),
      phoneNumber.slice(3, 6),
      phoneNumber.slice(6),
    ].join('-');

    const templateData = {
      precinctId,
      phoneNumber,
      problem,
      message,
      createdAt,
      formattedPhone,
    };

    // First, try sending the info to the backend, which can
    return api
      .post('/submit_ticket', {
        requester_name: ticketRequester(templateData),
        phone_number: '1' + phoneNumber,
        title: ticketSubject(templateData),
        body: ticketBody(templateData),
        precinct_id: precinctId,
      })
      .catch((e) => {
        console.error(
          'Error submitting ticket to backend; sending direct to Zendesk',
          e
        );

        return zendeskAPI.post('/api/v2/requests.json', {
          request: {
            requester: { name: 'Anonymous Precinct Captain' },
            subject: ticketSubject(templateData),
            comment: { body: ticketBackupBody(templateData) },
          },
        });
      });
  },
};
