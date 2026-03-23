#!/bin/bash

# run_tests.sh - Cloud Memo Test Runner Script

# Base directory of the project
PROJECT_ROOT=$(pwd)

# Default to running all tests if no arguments are provided
TEST_TARGET=${1:-"**/*.test.tsx"}

echo "--- 🚀 Running Cloud Memo Tests ---"
echo "Target: $TEST_TARGET"

# Execute Jest using npm test
npm test -- "$TEST_TARGET" --passWithNoTests

# Capture exit code
RESULT=$?

if [ $RESULT -eq 0 ]; then
  echo "--- ✅ All tests in $TEST_TARGET passed! ---"
else
  echo "--- ❌ Some tests in $TEST_TARGET failed. ---"
fi

exit $RESULT
