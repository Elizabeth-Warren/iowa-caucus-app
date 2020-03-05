// https://docs.cypress.io/api/introduction/api.html

const candidates = ['Warren', 'Biden', 'Sanders', 'Buttigieg'];

describe('User has to resolve a tie', () => {
  it('Logs in to Webster County', () => {
    cy.visit('/log-in');
    cy.get('input[name=code]').type('948094');
    cy.get('input[type=tel]').type('55555555555');
    cy.get('form').submit();
    cy.url().should('eq', `${Cypress.config().baseUrl}`);
    cy.contains('Webster County');
  });
  it('Verifies that there are 18 available delegates', () => {
    cy.get('[data-test=submit]').click();
    cy.contains('[data-test=delegates-assigned]', '0/18');
  });
  it('Sets the attendee count at 60 and gets the correct viability', () => {
    cy.get('[data-test=attendee-count')
      .find('input[type=number]')
      .type('60');
    cy.contains('[data-test=attendees-counted]', '0/60');
    cy.contains('[data-test=viability-threshold]', '9');
  });
  it('Creates a four-way tie situation', () => {
    candidates.forEach((name) => {
      cy.get(`[data-test=alignment-row-${name.toLowerCase()}]`)
        .find('input[type=number]')
        .type(15);
    });
    cy.contains('[data-test=delegates-assigned]', '20/18');
  });
  it('Prompts the user to resolve the tie', () => {
    cy.get('[data-test=submit]').click();
    cy.contains('Review');
    cy.get('[data-test=submit]').click();
    cy.contains('Realign');
    cy.get('[data-test=submit]').click();
    cy.contains('[data-test=tie-form]', "There's a tie!");
  });
  it('Validates the entry', () => {
    cy.get('[data-test=tie-form]').submit();
    cy.contains('You must choose 2 winners.');
    cy.get('[data-test=tie-form] input[type="checkbox"]').check({
      multiple: true,
    });
    cy.get('[data-test=tie-form]').submit();
    cy.contains('You must choose 2 winners.');
    cy.get('[data-test=tie-form] input[type="checkbox"]').uncheck({
      multiple: true,
    });
    cy.get('[data-test=tie-form] input[value=Warren]').check();
    cy.get('[data-test=tie-form] input[value=Buttigieg]').check();
    cy.get('[data-test=tie-form]').submit();
    cy.contains('Review');
  });
  it('Shows the resolved delegate counts', () => {
    cy.contains('[data-test=review-row-warren]', '5');
    cy.contains('[data-test=review-row-biden]', '4');
    cy.contains('[data-test=review-row-sanders]', '4');
    cy.contains('[data-test=review-row-buttigieg]', '5');
    cy.contains('[data-test=delegates-assigned]', '18/18');
    cy.contains('[data-test=attendees-counted]', '60/60');
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
