#!/bin/bash

if [ $# -ne 5 ]; then
    echo $0: usage: startPapillon pathToPapillonJar tag browserPath homepage url
    exit 1
fi

echo "TAG = $2"
echo "Browser = $3"
echo "Homepage = $4"
echo "URL = $5"

echo "starting apache server"
sh ~/enterprise-papillon-v5.2/apache-tomcat-9.0.12/bin/startup.sh &
echo "allowing server to start..."
sleep 10
echo "starting papillon..."
java -jar "$1" &
PID=$!
echo "$PID"
sleep 10
PAPILLON_TAG="$2" "$3 --remote-debugging-port=21222" &
sleep 30

echo "sleeping for experiment duration"
sleep 80
sh ~/enterprise-papillon-v5.2/apache-tomcat-9.0.12/bin/shutdown.sh &
kill $PID
pkill chrome
echo "Finished"
exit