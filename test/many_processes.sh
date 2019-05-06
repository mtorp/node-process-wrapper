#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

`$DIR/infinite_loop.sh` &  #`$DIR/infinite_loop.sh` & `$DIR/infinite_loop.sh` &

echo "many_processes.sh dies here"