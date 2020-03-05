// https://docs.cypress.io/api/introduction/api.html

describe('User is prompted to enter a valid precinct ID', () => {
  it('Visits the app root url and is redirected to log in', () => {
    cy.visit('/');
    cy.contains('form', 'Captain code');
  });
  it('Tries an incorrect precinct ID and is shown an error', () => {
    cy.get('input[name=code]').type('test');
    cy.get('form')
      .submit()
      .contains('Invalid code. Please try again.');
  });
  it('Tries an invalid phone number and is shown an error', () => {
    cy.get('input[type=tel]').type('test');
    cy.get('form')
      .submit()
      .contains('Please enter a valid phone number.');
  });
  it('Tries a valid precinct ID and phone number and is taken to the home screen', () => {
    cy.get('input[name=code]')
      .clear()
      .type('1593700');
    cy.get('input[type=tel]')
      .clear()
      .type('55555555555');
    cy.get('form').submit();
    cy.url().should('eq', `${Cypress.config().baseUrl}`);
  });
  it('Can change the precinct', () => {
    cy.get('[data-test=change-precinct]').click();
    cy.get('input[name=code]')
      .clear()
      .type('947672');
    cy.get('form').submit();
    cy.url().should('eq', `${Cypress.config().baseUrl}`);
  });
});
