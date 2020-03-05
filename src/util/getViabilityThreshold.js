/**
 * Calculates the number of attendees necessary for a candidate to receive any
 * delegates based on the total caucus attendees and the total available
 * delegates.
 * @param {number} totalAttendees
 * @param {number} totalDelegates
 * @return {number}
 */
export default function getViabilityThreshold(totalAttendees, totalDelegates) {
  switch (totalDelegates) {
    case 1:
      // This is a simple majority case, so there is no threshold, just chaos.
      return 0;
    case 2:
      return Math.ceil(totalAttendees / 4);
    case 3:
      return Math.ceil(totalAttendees / 6);
    default:
      return Math.ceil(totalAttendees / 6.67);
  }
}
