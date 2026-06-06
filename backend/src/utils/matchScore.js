function normalizeSet(values) {
  return new Set((values || []).map((value) => String(value).trim().toLowerCase()).filter(Boolean));
}

function scoreMatch(studentProfile, alumniProfile, options = {}) {
  const yearRange = Number.isInteger(options.yearRange) ? options.yearRange : 3;
  let score = 0;

  // Higher scores float the most relevant alumni to the top: domain overlap first, then shared interests, then nearby graduation years.
  if (
    studentProfile.domain &&
    alumniProfile.domain &&
    String(studentProfile.domain).trim().toLowerCase() === String(alumniProfile.domain).trim().toLowerCase()
  ) {
    score += 3;
  }

  const studentInterests = normalizeSet(studentProfile.interests);
  const alumniInterests = normalizeSet(alumniProfile.interests);

  for (const interest of studentInterests) {
    if (alumniInterests.has(interest)) {
      score += 1;
    }
  }

  if (
    Number.isInteger(studentProfile.gradYear) &&
    Number.isInteger(alumniProfile.gradYear) &&
    Math.abs(studentProfile.gradYear - alumniProfile.gradYear) <= yearRange
  ) {
    score += 1;
  }

  return score;
}

module.exports = {
  scoreMatch,
};