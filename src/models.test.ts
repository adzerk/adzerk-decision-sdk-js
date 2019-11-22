import 'jest';

import { isDecisionMultiWinner } from './models';

test('isDecisionMultiWinner properly identifies single winner', () => {
  let decisions = {
    div1: {},
  };

  expect(isDecisionMultiWinner(decisions)).toBeFalsy();
});

test('isDecisionMultiWinner properly identifies multi-winner', () => {
  let decisions = {
    div1: [{}],
  };

  expect(isDecisionMultiWinner(decisions)).toBeTruthy();
});
