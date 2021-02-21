#!/bin/bash

if [ $# -ne 2 ]; then
    echo $0: usage: navigateHome pathToBrowserExecutable url
    exit 1
fi

"$1" -incognito "$2"