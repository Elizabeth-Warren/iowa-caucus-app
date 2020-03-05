// https://docs.cypress.io/api/introduction/api.html

const candidates = ['Warren', 'Biden'];
const secondaryCandidates = ['Sanders', 'Buttigieg', 'Bloomberg'];

describe('User has to resolve a tie', () => {
  it('Logs in to Adair County', () => {
    cy.visit('/log-in');
    cy.get('input[name=code]').type('948199');
    cy.get('input[type=tel]').type('55555555555');
    cy.get('form').submit();
    cy.url().should('eq', `${Cypress.config().baseUrl}`);
    cy.contains('Adair County');
  });
  it('Verifies that there are 8 available delegates', () => {
    cy.get('[data-test=submit]').click();
    cy.contains('[data-test=delegates-assigned]', '0/8');
  });
  it('Sets the attendee count at 133 and gets the correct viability', () => {
    cy.get('[data-test=attendee-count')
      .find('input[type=number]')
      .type('133');
    cy.contains('[data-test=attendees-counted]', '0/133');
    cy.contains('[data-test=viability-threshold]', '20');
  });
  it('Creates a tie', () => {
    candidates.forEach((name) => {
      cy.get(`[data-test=alignment-row-${name.toLowerCase()}]`)
        .find('input[type=number]')
        .type(35);
    });
    secondaryCandidates.forEach((name) => {
      cy.get(`[data-test=alignment-row-${name.toLowerCase()}]`)
        .find('input[type=number]')
        .type(21);
    });
    cy.contains('[data-test=delegates-assigned]', '10/8');
  });
  it('Prompts the user to resolve the ties', () => {
    cy.get('[data-test=submit]').click();
    cy.contains('Review');
    cy.get('[data-test=submit]').click();
    cy.contains('Realign');
    cy.get('[data-test=submit]').click();
    cy.contains('[data-test=tie-form]', "There's a tie!");
    cy.get('[data-test=tie-form] input[value=Sanders]').check();
    cy.get('[data-test=tie-form]').submit();
    cy.contains('Review');
  });
  it('Shows the resolved delegate counts', () => {
    cy.contains('[data-test=review-row-warren]', '2');
    cy.contains('[data-test=review-row-biden]', '2');
    cy.contains('[data-test=review-row-sanders]', '2');
    cy.contains('[data-test=review-row-buttigieg]', '1');
    cy.contains('[data-test=review-row-bloomberg]', '1');
    cy.contains('[data-test=delegates-assigned]', '8/8');
    cy.contains('[data-test=attendees-counted]', '133/133');
  });
  it('Completes check out', () => {
    cy.get('[data-test=submit]').click();
    cy.get('[data-test=check-out-form]')
      .find('textarea')
      .type('test');
    cy.get('[data-test=submit]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}log-in`);
  });
});
