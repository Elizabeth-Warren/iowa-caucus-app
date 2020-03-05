import TieStatuses from '../constants/TieStatuses';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import getViabilityThreshold from './getViabilityThreshold';
import sumBy from 'lodash/sumBy';
import './typedef';

const getDelegateDifference = (candidates, totalDelegates) =>
  sumBy(candidates, 'delegates') - totalDelegates;

const areCandidatesTied = (a, b) =>
  (a.rawDelegates % 1).toFixed(4) === (b.rawDelegates % 1).toFixed(4);

/**
 * Calculates how many delegates will be attributed for a given number of
 * caucusers, using total attendees and total delegates to determine the
 * viability threshold.
 * @param {number} totalAttendees
 * @param {number} totalDelegates
 * @param {number} caucusers
 * @returns {number} - delegates awarded
 */
function calculateDelegates(totalAttendees, totalDelegates, caucusers) {
  const viabilityThreshold = getViabilityThreshold(
    totalAttendees,
    totalDelegates
  );
  if (!totalAttendees || caucusers < viabilityThreshold) {
    return [0, 0];
  }
  const rawDelegates = Math.min(
    (caucusers * totalDelegates) / totalAttendees,
    totalDelegates
  );
  return [Math.round(rawDelegates), rawDelegates];
}

/**
 * If there is only one available delegate, a simple majority will result in the
 * delegate being awarded to the winner. Ties wil need to be resolved in the UI.
 * @param {Array<CanididateStatus>} originalCandidates
 * @param {number} totalDelegates
 * @return {Array<CandidateStatus>}
 */
function applySimpleMajority(originalCandidates, totalDelegates) {
  const candidates = cloneDeep(originalCandidates);
  const candidatesWithMajority = candidates.reduce((arr, candidate) => {
    if (!arr.length || arr[0].caucusers === candidate.caucusers) {
      arr.push(candidate);
    } else if (arr[0].caucusers < candidate.caucusers) {
      arr = [candidate];
    }
    return arr;
  }, []);
  candidates.forEach((candidate) => {
    if (candidatesWithMajority.includes(candidate)) {
      candidate.delegates = totalDelegates;
    }
  });
  if (candidatesWithMajority.length > 1) {
    const targetCandidate = candidatesWithMajority[0];
    markPotentialTies(candidates, targetCandidate, true);
  }
  return candidates;
}

/**
 * Determine and mark ties. Ties are when two or more candidates are rounding
 * an equal amount, i.e. the decimal remainder of the raw delegate count is
 * equal. THIS MUTATES THE PROVIDED CANDIDATES ARRAY by marking tied candidates
 * with an array of candidate names with whom they are tied (not including
 * themselves).
 * @param {Array<CandidateStatus>} originalCandidates
 * @param {CandidateStatus} targetCandidate
 * @param {boolean} includeSingleDelegateCandidates - generally we don't want to
 *   take the only delegate away from any viable candidate. In this case we
 *   filter them from possible removal in a tie situation. However, sometimes
 *   this is unavoidable - like with a three-way tie over a simple majority.
 */
function markPotentialTies(
  candidates,
  targetCandidate,
  includeSingleDelegateCandidates = false
) {
  candidates
    .filter(
      (candidate) =>
        areCandidatesTied(targetCandidate, candidate) &&
        (includeSingleDelegateCandidates || candidate.delegates > 1)
    )
    .forEach((candidate, i, arr) => {
      if (arr.length > 1) {
        candidate.ties = arr
          .filter((tiedCandidate) => tiedCandidate.name !== candidate.name)
          .map((tiedCandidate) => tiedCandidate.name);
      }
    });
}

/**
 * In the scenario where the current candidate statuses would result in too few
 * delegates and all caucusers are assigned, the next closest candidate gets
 * rounded up a delegate.
 * @param {Array<CandidateStatus>} originalCandidates
 * @param {number} totalDelegates
 * @return {Array<CandidateStatus>}
 */
function roundUpDelegates(originalCandidates, totalDelegates) {
  const candidates = cloneDeep(originalCandidates);
  while (getDelegateDifference(candidates, totalDelegates) < 0) {
    const candidatesWhoHaveRoundedDown = candidates
      .filter(
        (candidate) =>
          candidate.delegates && candidate.delegates < candidate.rawDelegates
      )
      .sort((a, b) => {
        return (b.rawDelegates % 1) - (a.rawDelegates % 1);
      });
    const targetCandidate = candidatesWhoHaveRoundedDown[0];
    if (targetCandidate) {
      // Give the candidate closest to gaining another delegate and anyone tied
      // with them a delegate. If this creates an overage of assigned delegates,
      // that will be addressed by the `roundDownDelegates` function.
      const candidatesToGain = candidates.filter((candidate) =>
        areCandidatesTied(targetCandidate, candidate)
      );
      candidatesToGain.forEach((candidate) => {
        candidate.delegates++;
      });
    } else {
      // We should only ever get here if there aren't enough caucus-goers
      // assigned yet and thus not all delegates have been naturally allocated.
      return candidates;
    }
  }
  return candidates;
}

/**
 * In scenarios where the current candidate statuses would result in
 * too many delegates, somebody has to lose a delegate. This can happen in a
 * few ways:
 * - TAKE FROM THE BIGGEST ROUNDERS: Remove a delegate from the candidate who
 *   did the most rounding. We do not remove a candidate's only delegate if we
 *   can avoid it.
 * - A TIE: If two or more candidates are rounding an equal amount to gain a
 *   delegate and if allocating each of them that delegate would result in an
 *   excess of assigned delegates there is a coin toss (or drawing of straws for
 *   multi-way ties) to determine who actually gains delegates. We can't resolve
 *   that here so a UI will be triggered.
 * @param {Array<CandidateStatus>} originalCandidates
 * @param {number} totalDelegates
 * @return {Array<CandidateStatus>}
 */
function roundDownDelegates(originalCandidates, totalDelegates) {
  const candidates = cloneDeep(originalCandidates);
  while (getDelegateDifference(candidates, totalDelegates) > 0) {
    // Take from the biggest rounder.
    const candidatesWhoHaveRoundedUp = candidates
      // First figure out who has rounded up their delegates.
      .filter((candidate) => candidate.delegates > candidate.rawDelegates)
      // Then sort them by their smallest fractional remainder of raw delegates
      // in ascending order.
      .sort((a, b) => {
        return (a.rawDelegates % 1) - (b.rawDelegates % 1);
      });
    // We should always prefer taking a delegate from a candidate who has more
    // than one delegate. If necessary, once those candidates have been
    // reduced to one delegate, we start taking from candidates who have done
    // any rounding up at all even if it is their only delegate.
    const targetCandidate =
      candidatesWhoHaveRoundedUp.find((candidate) => candidate.delegates > 1) ||
      candidatesWhoHaveRoundedUp[0];

    if (!targetCandidate) {
      // This happens if no one has rounded off their raw delegates. If we've
      // gotten here it's because the number of assigned attendees has exceeded
      // the official attendee count. The delegate counts are naturally going to
      // be over the assigned amount. We won't resolve that here, but we'll show
      // warnings in the UI so the user can fix it.
      return candidates;
    }

    // Mark potential ties.
    markPotentialTies(candidates, targetCandidate);

    if (!targetCandidate.ties.length) {
      // If the candidate is not involved in any ties, take a delegate.
      targetCandidate.delegates--;
    } else if (
      // If the candidate is involved in a tie and the overage of assigned
      // delegates exceeds the number of people involved in a tie, we can
      // safely take a delegate away from everyone involved in the tie. Keep in
      // mind that the candidate's array in which we mark ties does not include
      // their own name.
      getDelegateDifference(candidates, totalDelegates) >
      targetCandidate.ties.length
    ) {
      targetCandidate.delegates--;
      candidatesWhoHaveRoundedUp.forEach((candidate) => {
        if (targetCandidate.ties.includes(candidate.name)) {
          candidate.delegates--;
        }
      });
    } else {
      // Return early. We can't determine a proper delegate count without
      // manually tie-breaking in the UI.
      candidates.forEach((candidate) => {
        candidate.tieStatus = candidate.ties.length
          ? TieStatuses.UNRESOLVED
          : TieStatuses.NONE;
      });
      return candidates;
    }
  }
  // If we've gotten here then the delegate number has been naturally adjusted,
  // we don't need to resolve any oustanding ties.
  candidates.forEach((candidate) => {
    candidate.ties = [];
    candidate.tieStatus = TieStatuses.NONE;
  });
  return candidates;
}

export default function mapCandidateStatuses({
  names = [],
  caucuserCount = {},
  totalAttendees = 0,
  totalDelegates = 0,
}) {
  // Create an initial set of candidate statuses.
  let candidates = names.map((name) => {
    const caucusers = get(caucuserCount, name, 0);
    const [delegates, rawDelegates] = calculateDelegates(
      totalAttendees,
      totalDelegates,
      caucusers
    );
    return { name, caucusers, delegates, rawDelegates, ties: [] };
  });

  // If there is only one delegate available, we use the simple majority rule.
  if (totalDelegates === 1) {
    candidates = applySimpleMajority(candidates, totalDelegates);
  }

  // If all caucus goers are accounted for, round up delegates as necessary.
  if (totalAttendees && sumBy(candidates, 'caucusers') >= totalAttendees) {
    candidates = roundUpDelegates(candidates, totalDelegates);
  }

  // Round down delegates if necessary, resolving any ties that we can.
  candidates = roundDownDelegates(candidates, totalDelegates);

  // Return the results.
  return candidates;
}
