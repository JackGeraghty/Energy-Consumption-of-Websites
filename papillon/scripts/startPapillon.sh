#!/bin/bash

if [ $# -ne 4 ]; then
    echo $0: usage: startPapillon pathToPapillonJar tag browserPath url
    exit 1
fi

echo "TAG = $2"
echo "Browser = $3"
echo "URL = $4"

echo "starting apache server"
sh ~/enterprise-papillon-v5.2/apache-tomcat-9.0.12/bin/startup.sh &
echo "allowing server to start..."
sleep 10
echo "starting papillon..."
java -jar "$1" &
PID=$!
echo "$PID"
sleep 5
PAPILLON_TAG="$2" "$3"
sleep 5
echo "Navigating to $4"
"$3" "$4"
echo "sleeping for experiment duration"
sleep 10
sh ~/enterprise-papillon-v5.2/apache-tomcat-9.0.12/bin/shutdown.sh
kill $PID

echo "Finished"