export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Formatting (no code changes)
        'refactor', // Code refactoring
        'perf', // Performance improvement
        'test', // Adding or correcting tests
        'chore', // Maintenance tasks
        'ci', // CI/CD changes
        'build', // Build system changes
        'revert', // Revert a previous commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 90],
    'body-max-line-length': [2, 'always', 100],
  },
};
