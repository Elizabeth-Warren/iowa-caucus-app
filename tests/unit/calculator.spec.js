import TieStatuses from '../../src/constants/TieStatuses';
import getViabilityThreshold from '../../src/util/getViabilityThreshold';
import mapCandidateStatuses from '../../src/util/mapCandidateStatuses';

test('calculates viability threshold', () => {
  expect(getViabilityThreshold(5, 1)).toBe(0);
  expect(getViabilityThreshold(45, 3)).toBe(8);
  expect(getViabilityThreshold(25, 5)).toBe(4);
  expect(getViabilityThreshold(40, 2)).toBe(10);
  expect(getViabilityThreshold(60, 18)).toBe(9);
});

const names = ['Warren', 'Sanders', 'Biden'];

test('determines natural delegate results with no special cases', () => {
  const input = {
    names,
    caucuserCount: {
      Warren: 20,
      Sanders: 10,
      Biden: 7,
    },
    totalAttendees: 37,
    totalDelegates: 7,
  };
  mapCandidateStatuses(input).forEach((candidate) => {
    switch (candidate.name) {
      case 'Warren':
        expect(candidate.delegates).toEqual(4);
        break;
      case 'Sanders':
        expect(candidate.delegates).toEqual(2);
        break;
      case 'Biden':
        expect(candidate.delegates).toEqual(1);
        break;
    }
  });
});

test('resolves a simple majority', () => {
  const input = {
    names,
    caucuserCount: {
      Warren: 10,
      Sanders: 8,
      Biden: 8,
    },
    totalAttendees: 26,
    totalDelegates: 1,
  };
  mapCandidateStatuses(input).forEach((candidate) => {
    switch (candidate.name) {
      case 'Warren':
        expect(candidate.delegates).toEqual(1);
        break;
      case 'Sanders':
        expect(candidate.delegates).toEqual(0);
        break;
      case 'Biden':
        expect(candidate.delegates).toEqual(0);
        break;
    }
    expect(candidate.ties).toEqual([]);
  });
});

test('avoids potential tie where a candidate only has one delegate by removing delegate from other candidate', () => {
  const input = {
    names,
    caucuserCount: {
      Warren: 75,
      Biden: 15,
    },
    totalAttendees: 90,
    totalDelegates: 3,
  };
  mapCandidateStatuses(input).forEach((candidate) => {
    switch (candidate.name) {
      case 'Warren':
        expect(candidate.delegates).toEqual(2);
        expect(candidate.rawDelegates).toEqual(2.5);
        break;
      case 'Biden':
        expect(candidate.delegates).toEqual(1);
        expect(candidate.rawDelegates).toEqual(0.5);
        break;
    }
    expect(candidate.ties).toEqual([]);
  });
});

test('resolves tie by removing a delegate who was assigned by the largest rounding margin', () => {
  const input = {
    names,
    caucuserCount: {
      Warren: 100,
      Sanders: 50,
      Biden: 50,
    },
    totalAttendees: 200,
    totalDelegates: 7,
  };
  mapCandidateStatuses(input).forEach((candidate) => {
    switch (candidate.name) {
      case 'Warren':
        expect(candidate.delegates).toEqual(3);
        expect(candidate.rawDelegates).toEqual(3.5);
        break;
      case 'Sanders':
        expect(candidate.delegates).toEqual(2);
        expect(candidate.rawDelegates).toEqual(1.75);
        break;
      case 'Biden':
        expect(candidate.delegates).toEqual(2);
        expect(candidate.rawDelegates).toEqual(1.75);
        break;
    }
    expect(candidate.ties).toEqual([]);
  });
});

test("marks two-way ties for the UI that can't be resolved by rounding", () => {
  const input = {
    names,
    caucuserCount: {
      Warren: 100,
      Sanders: 50,
      Biden: 50,
    },
    totalAttendees: 200,
    totalDelegates: 6,
  };
  mapCandidateStatuses(input).forEach((candidate) => {
    switch (candidate.name) {
      case 'Warren':
        expect(candidate.delegates).toEqual(3);
        expect(candidate.ties).toEqual([]);
        break;
      case 'Sanders':
        expect(candidate.delegates).toEqual(2);
        expect(candidate.ties).toEqual(['Biden']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
      case 'Biden':
        expect(candidate.delegates).toEqual(2);
        expect(candidate.ties).toEqual(['Sanders']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
    }
  });
});

test("marks a multi-way for the UI that can't be resolved by rounding", () => {
  const input = {
    names: [...names, 'Harris'],
    caucuserCount: {
      Warren: 15,
      Sanders: 15,
      Biden: 15,
      Harris: 15,
    },
    totalAttendees: 60,
    totalDelegates: 18,
  };
  mapCandidateStatuses(input).forEach((candidate) => {
    switch (candidate.name) {
      case 'Warren':
        expect(candidate.ties).toEqual(['Sanders', 'Biden', 'Harris']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
      case 'Sanders':
        expect(candidate.ties).toEqual(['Warren', 'Biden', 'Harris']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
      case 'Biden':
        expect(candidate.ties).toEqual(['Warren', 'Sanders', 'Harris']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
      case 'Harris':
        expect(candidate.ties).toEqual(['Warren', 'Sanders', 'Biden']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
    }
    expect(candidate.delegates).toEqual(5);
  });
});

test("marks a simple majority, two-way tie that can't be resolved by rounding", () => {
  const input = {
    names,
    caucuserCount: {
      Warren: 10,
      Sanders: 10,
    },
    totalAttendees: 20,
    totalDelegates: 1,
  };
  mapCandidateStatuses(input).forEach((candidate) => {
    switch (candidate.name) {
      case 'Warren':
        expect(candidate.delegates).toEqual(1);
        expect(candidate.ties).toEqual(['Sanders']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
      case 'Sanders':
        expect(candidate.delegates).toEqual(1);
        expect(candidate.ties).toEqual(['Warren']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
    }
  });
});

test("marks a simple majority, multi-way tie that can't be resolved by rounding", () => {
  const input = {
    names,
    caucuserCount: {
      Warren: 10,
      Sanders: 10,
      Biden: 10,
    },
    totalAttendees: 30,
    totalDelegates: 1,
  };
  mapCandidateStatuses(input).forEach((candidate) => {
    switch (candidate.name) {
      case 'Warren':
        expect(candidate.delegates).toEqual(1);
        expect(candidate.ties).toEqual(['Sanders', 'Biden']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
      case 'Sanders':
        expect(candidate.delegates).toEqual(1);
        expect(candidate.ties).toEqual(['Warren', 'Biden']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
      case 'Biden':
        expect(candidate.delegates).toEqual(1);
        expect(candidate.ties).toEqual(['Warren', 'Sanders']);
        expect(candidate.tieStatus).toEqual(TieStatuses.UNRESOLVED);
        break;
    }
  });
});
