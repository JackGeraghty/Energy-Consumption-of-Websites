#!/bin/bash

if [ $# -ne 2 ]; then
    echo $0: usage: navigateHome browser url
    exit 1
fi

"$1" --remote-debugging-port=21222 "$2"