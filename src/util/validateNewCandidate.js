import damerauLevenshtein from './damerauLevenshtein';
import candidateWarningNames from '../constants/candidateWarningNames';

function cleanCandidateName(name) {
  return name.trim().toLowerCase();
}

function throwWarning(msg) {
  const err = new Error(
    `${msg}. If you're sure this is a new candidate and not already on the list, press Submit again.`
  );
  err.code = 'candidateNameWarning';

  throw err;
}

export function isCandidateNameWarning(err) {
  return err && err.code && err.code === 'candidateNameWarning';
}

export default function validateNewCandidate(
  candidateNameRaw,
  existingCandidatesRaw
) {
  const candidateName = candidateNameRaw.trim().toLowerCase();
  const existingCandidates = existingCandidatesRaw.map(cleanCandidateName);

  const namesToCheck = [{ name: candidateName, nameDesc: 'name' }];
  if (candidateName.indexOf(' ') !== -1) {
    // also check last name
    const names = candidateName.split(' ');
    namesToCheck.push({
      name: names[names.length - 1].trim(),
      nameDesc: 'last name',
    });
  }

  namesToCheck.forEach(({ name, nameDesc }) => {
    existingCandidates.forEach((existingCandidate, i) => {
      const dist = damerauLevenshtein(name, existingCandidate);

      if (dist === 0) {
        throw new Error(`A candidate with that ${nameDesc} already exists`);
      }

      if (dist === 1) {
        throw new Error(
          `That ${nameDesc} is too similar to an existing candidate: ${existingCandidatesRaw[i]}`
        );
      }
    });

    if (candidateWarningNames[name]) {
      const { entryName, fullName } = candidateWarningNames[name];
      throwWarning(
        `Please use "${entryName}" instead of adding a new option for ${fullName}`
      );
    }
  });
}
