import validateNewCandidate from '../../src/util/validateNewCandidate';

const existingCandidates = ['Warren', 'Biden', 'Sanders', 'Buttigieg'];

test.each`
  name                  | expectedError
  ${'Warren'}           | ${'A candidate with that name already exists'}
  ${'Liz Warren'}       | ${'A candidate with that last name already exists'}
  ${'  Liz   Warren  '} | ${'A candidate with that last name already exists'}
  ${' bidn '}           | ${'That name is too similar to an existing candidate: Biden'}
  ${'JOE bidn '}        | ${'That last name is too similar to an existing candidate: Biden'}
  ${' Bernie '}         | ${'Please use "Sanders" instead of adding a new option for Bernie Sanders. If you\'re sure this is a new candidate and not already on the list, press Submit again.'}
  ${' mayor pete '}     | ${'Please use "Buttigieg" instead of adding a new option for Pete Buttigieg. If you\'re sure this is a new candidate and not already on the list, press Submit again.'}
  ${' miss amy '}       | ${'Please use "Klobuchar" instead of adding a new option for Amy Klobuchar. If you\'re sure this is a new candidate and not already on the list, press Submit again.'}
  ${'budivich'}         | ${'Please use "Buttigieg" instead of adding a new option for Pete Buttigieg. If you\'re sure this is a new candidate and not already on the list, press Submit again.'}
  ${'eLIZabeth'}        | ${'Please use "Warren" instead of adding a new option for Elizabeth Warren. If you\'re sure this is a new candidate and not already on the list, press Submit again.'}
  ${'Someone New'}      | ${null}
  ${'Beto'}             | ${null}
  ${"O'Rourke"}         | ${null}
  ${'Hot Dogs'}         | ${null}
`('validating "$name" throws "$expectedError"', ({ name, expectedError }) => {
  if (expectedError) {
    expect(() => {
      validateNewCandidate(name, existingCandidates);
    }).toThrowError(expectedError);
  } else {
    expect(() => {
      validateNewCandidate(name, existingCandidates);
    }).not.toThrow();
  }
});
