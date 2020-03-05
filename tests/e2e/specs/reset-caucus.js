// https://docs.cypress.io/api/introduction/api.html

const candidates = ['Warren', 'Biden', 'Sanders', 'Buttigieg'];

describe('User resets caucus after changing precincts', () => {
  it('Logs in to Webster County', () => {
    cy.visit('/log-in');
    cy.get('input[name=code]').type('948094');
    cy.get('input[type=tel]').type('55555555555');
    cy.get('form').submit();
    cy.url().should('eq', `${Cypress.config().baseUrl}`);
    cy.contains('Webster County');
  });
  it('Sets the attendee count at 60 and gets the correct viability', () => {
    cy.get('[data-test=submit]').click();
    cy.get('[data-test=attendee-count')
      .find('input[type=number]')
      .type('60');
    cy.contains('[data-test=attendees-counted]', '0/60');
    cy.contains('[data-test=viability-threshold]', '9');
  });
  it('Assigns delegates', () => {
    candidates.forEach((name) => {
      cy.get(`[data-test=alignment-row-${name.toLowerCase()}]`)
        .find('input[type=number]')
        .type(15);
    });
    cy.contains('[data-test=delegates-assigned]', '20/18');
  });
  it('Goes back to the log in page and logs in to Appanoose county', () => {
    cy.visit('/log-in');
    cy.get('input[type=tel]').type('55555555555');
    cy.get('input[name=code]').type('946560');
    cy.get('form').submit();
    cy.url().should('eq', `${Cypress.config().baseUrl}`);
    cy.contains('Appanoose County');
  });
  it('Observes that attendee count and assignments are reset', () => {
    cy.get('[data-test=submit]').click();
    cy.get('[data-test=attendee-count')
      .find('input[type=number]')
      .should('have.value', '0');
    candidates.forEach((name) => {
      cy.get(`[data-test=alignment-row-${name.toLowerCase()}]`)
        .find('input[type=number]')
        .should('have.value', '0');
    });
  });
});
