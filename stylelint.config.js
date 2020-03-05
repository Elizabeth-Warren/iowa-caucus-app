module.exports = {
  extends: ['stylelint-config-recommended'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          /apply/,
          /tailwind/,
          /screen/,
          /if/,
          /else/,
          /return/,
          /function/,
          /debug/,
        ],
      },
    ],
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null,
  },
};
