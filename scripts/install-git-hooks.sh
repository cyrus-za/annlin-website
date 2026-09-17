#!/bin/sh
set -eu

git config core.hooksPath githooks
printf '%s\n' 'Git hooks geïnstalleer vanaf githooks/.'
