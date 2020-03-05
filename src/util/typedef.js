/**
 * @typedef CaucuserMap
 * @type {object}
 * @prop {number} [candidateName] - the number of caucusers assigend to
 *   `candidateName`
 */

/**
 * @typedef Precinct
 * @type {object}
 * @prop {string} county - County name
 * @prop {number} delegates - Available delegates
 * @prop {string} id - Precinct ID
 * @prop {string} code - Precinct code
 * @prop {string} name - Precinct name
 * @prop {object} location - Precinct location
 * @prop {string} location.name
 * @prop {string} location.address
 * @prop {string} location.city
 * @prop {string} location.zip
 * @prop {string} updatedAt - Last time data was pulled. String timestamp.
 * @prop {boolean} fromCache - Whether the data we have is the latest from the
 *   web or from memory/cache
 */

/**
 * @typedef PrecinctMap
 * @type {object}
 * @prop {Precinct} [precinctId]
 */

/**
 * @typedef Problem
 * @type {object}
 * @prop {string} description
 */

/**
 * @typedef CandidateStatus
 * @type {object}
 * @prop {string} name - Candidate's name
 * @prop {number} caucusers - Number of assigned caucusers, derived from
 *   `state.caucuserCount`
 * @prop {number} delegates - Number of delegates allocated to this candidate,
 *   derived from the `calculateDelegates` helper function
 * @prop {number} rawDelegates - The raw number of delegates assigned to the
 *   delegate before rounding.
 * @prop {Array<string>} ties - The names of candidates with whom this candidate
 *   is tied for caucusers.
 * @prop {string} tieStatus - One of "none", "won", "lost", or "unresolved".
 */
