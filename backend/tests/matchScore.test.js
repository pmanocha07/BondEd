const test = require('node:test');
const assert = require('node:assert/strict');

const { scoreMatch } = require('../src/utils/matchScore');

test('scoreMatch adds domain, shared interests, and year proximity points', () => {
  const score = scoreMatch(
    { domain: 'Computer Science', interests: ['AI', 'Founders'], gradYear: 2027 },
    { domain: 'computer science', interests: ['AI', 'Design'], gradYear: 2025 },
    { yearRange: 3 },
  );

  assert.equal(score, 5);
});