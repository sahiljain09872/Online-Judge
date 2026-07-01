const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

const problems = [
  {
    name: 'Two Sum',
    code: 'two-sum',
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'Easy',
    sampleInput: '4\n2 7 11 15\n9',
    sampleOutput: '0 1',
    constraints: '- `2 <= nums.length <= 10^4`\n- `-10^9 <= nums[i] <= 10^9`\n- `-10^9 <= target <= 10^9`',
  },
  {
    name: 'Reverse String',
    code: 'reverse-string',
    statement: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with \`O(1)\` extra memory.`,
    difficulty: 'Easy',
    sampleInput: 'hello',
    sampleOutput: 'olleh',
    constraints: '- `1 <= s.length <= 10^5`\n- `s[i]` is a printable ascii character.',
  },
  {
    name: 'Valid Parentheses',
    code: 'valid-parentheses',
    statement: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'Medium',
    sampleInput: '()[]{}',
    sampleOutput: 'true',
    constraints: '- `1 <= s.length <= 10^4`\n- `s` consists of parentheses only \`()[]{}\`.',
  },
  {
    name: 'Search Element',
    code: 'search-element',
    statement: `Given an array of integers \`arr\` and an integer \`key\`, return the index of the \`key\` in the array. If the \`key\` is not present, return \`-1\`.

The array is 0-indexed.`,
    difficulty: 'Easy',
    sampleInput: '5\n10 20 30 40 50\n30',
    sampleOutput: '2',
    constraints: '- `1 <= arr.length <= 10^5`\n- `-10^9 <= arr[i], key <= 10^9`',
  }
];

// 1 or more test cases per problem
const testCasesMap = {
  'two-sum': [
    { input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false },
    { input: '3\n3 2 4\n6', output: '1 2', isHidden: true },
    { input: '2\n3 3\n6', output: '0 1', isHidden: true }
  ],
  'reverse-string': [
    { input: 'hello', output: 'olleh', isHidden: false },
    { input: 'Hannah', output: 'hannaH', isHidden: true },
    { input: 'A', output: 'A', isHidden: true }
  ],
  'valid-parentheses': [
    { input: '()', output: 'true', isHidden: false },
    { input: '()[]{}', output: 'true', isHidden: false },
    { input: '(]', output: 'false', isHidden: true },
    { input: '([)]', output: 'false', isHidden: true },
    { input: '{[]}', output: 'true', isHidden: true }
  ],
  'search-element': [
    { input: '5\n10 20 30 40 50\n30', output: '2', isHidden: false },
    { input: '4\n1 2 3 4\n5', output: '-1', isHidden: false },
    { input: '1\n100\n100', output: '0', isHidden: true },
    { input: '6\n5 15 25 35 45 55\n15', output: '1', isHidden: true }
  ]
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding.');

    // Clear existing
    await Problem.deleteMany({});
    await TestCase.deleteMany({});
    console.log('Cleared existing problems and test cases.');

    for (let probData of problems) {
      const problem = await Problem.create(probData);
      console.log(`Created problem: ${problem.name}`);

      const tcs = testCasesMap[problem.code];
      if (tcs) {
        for (let tc of tcs) {
          await TestCase.create({
            problem: problem._id,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden
          });
        }
        console.log(`  -> Added ${tcs.length} test cases.`);
      }
    }

    console.log('Seeding completed successfully.');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
