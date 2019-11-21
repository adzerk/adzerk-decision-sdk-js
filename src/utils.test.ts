import 'jest';

import { removeUndefinedAndBlocklisted } from './utils';

test('removeUndefinedAndBlocklisted removes null values', () => {
  let obj = {
    keyOne: 'this',
    keyTwo: 'is',
    keyThree: null,
    keyFour: null,
    keyFive: 'a',
    keySix: 'test',
  };

  let result = removeUndefinedAndBlocklisted(obj);

  expect(result).toEqual({
    keyOne: 'this',
    keyTwo: 'is',
    keyFive: 'a',
    keySix: 'test',
  });
});

test('removeUndefinedAndBlocklisted removes undefined values', () => {
  let obj = {
    keyOne: 'this',
    keyTwo: 'is',
    keyThree: undefined,
    keyFour: undefined,
    keyFive: 'a',
    keySix: 'test',
  };

  let result = removeUndefinedAndBlocklisted(obj);

  expect(result).toEqual({
    keyOne: 'this',
    keyTwo: 'is',
    keyFive: 'a',
    keySix: 'test',
  });
});

test('removeUndefinedAndBlocklisted removes blocklisted values', () => {
  let obj = {
    keyOne: 'this',
    keyTwo: 'is',
    keyThree: 'not',
    keyFour: 'really',
    keyFive: 'a',
    keySix: 'test',
  };

  let result = removeUndefinedAndBlocklisted(obj, ['keyThree', 'keyFour']);

  expect(result).toEqual({
    keyOne: 'this',
    keyTwo: 'is',
    keyFive: 'a',
    keySix: 'test',
  });
});

test('removeUndefinedAndBlocklisted removes nested values', () => {
  let obj = {
    one: {
      message: 'Hello',
    },
    two: {
      message: ', ',
      bad: null,
    },
    three: {
      four: {
        message: 'world!',
        bad: undefined,
      },
    },
  };

  let result = removeUndefinedAndBlocklisted(obj);

  expect(result).toEqual({
    one: {
      message: 'Hello',
    },
    two: {
      message: ', ',
    },
    three: {
      four: {
        message: 'world!',
      },
    },
  });
});

test('removeUndefinedAndBlocklisted works for arrays', () => {
  let arr = [
    {
      key: 'something',
    },
    {
      key: 'else',
    },
    {
      key: 'entirely',
      bad: null,
    },
  ];

  let result = removeUndefinedAndBlocklisted(arr);

  expect(result).toEqual([
    {
      key: 'something',
    },
    {
      key: 'else',
    },
    {
      key: 'entirely',
    },
  ]);
});

test('removeUndefinedAndBlocklisted works for nested arrays', () => {
  let obj = {
    placements: [
      {
        key: 'something',
      },
      {
        key: 'else',
      },
      {
        key: 'entirely',
        bad: null,
      },
    ],
  };

  let result = removeUndefinedAndBlocklisted(obj);

  expect(result).toEqual({
    placements: [
      {
        key: 'something',
      },
      {
        key: 'else',
      },
      {
        key: 'entirely',
      },
    ],
  });
});
