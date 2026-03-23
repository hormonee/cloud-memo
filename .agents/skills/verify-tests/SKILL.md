---
name: verify-tests
description: Skill for verifying and running tests in the Cloud Memo project using Jest.
---

# Project Test Verify Skill

This skill provides a standardized way to run and verify tests in the Cloud Memo project. It uses `Jest` as the primary test runner.

## Core Capabilities

- **Run All Tests**: Run the entire test suite to ensure overall project stability.
- **Run Specific Test**: Target a specific file or directory for faster feedback during development.
- **Test Coverage**: (Optional) Check code coverage to identify untested areas.

## How to Use

### 1. Run All Tests
To run all tests in the project:
```bash
./.agents/skills/verify-tests/scripts/run_tests.sh
```

### 2. Run a Specific Test File
To run a specific test file, pass the file path as an argument:
```bash
./.agents/skills/verify-tests/scripts/run_tests.sh app/dashboard/dashboard.test.tsx
```

### 3. Running with Watch Mode
For continuous testing during development:
```bash
npm run test:watch
```

## Interpreting Results

- **PASS**: The test suite or file passed all assertions.
- **FAIL**: One or more tests failed. Check the output for specific error messages and stack traces.

> [!TIP]
> Use the `-r` flag with the script to get a summary report after execution. (Feature pending implementation in scripts/run_tests.sh)
