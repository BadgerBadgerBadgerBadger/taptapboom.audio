#!/usr/bin/env bash

npm run test

# run coverage-coveralls only if COVERALLS_REPO_TOKEN env variable is set
if ! [ -z ${COVERALLS_REPO_TOKEN+x} ]; then npm run coverage-coveralls; fi
