#!/bin/bash

if [ $# -ne 2 ]; then
    echo $0: usage: startPapillon pathToApacheScript pathToPapillonJar
    exit 1
fi

echo "starting apache server"
sh "$1"
echo "allowing server to start..."
sleep 5
echo "starting papillon..."
java -jar "$2" &
sleep 5
PAPILLON_TAG=CHROME ~/../../usr/bin/google-chrome-stable
