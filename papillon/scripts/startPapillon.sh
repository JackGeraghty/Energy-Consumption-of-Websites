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
sleep 5
PAPILLON_TAG="$2" "$3" &
sleep 10
"$3" "$5" &
#
#sleep 5
#echo "Navigating home"
#"$3" "$4" &
#sleep 5
#echo "Navigating to $5"
#"$3" "$5" &
#echo "sleeping for experiment duration"
#sleep 30
#sh ~/enterprise-papillon-v5.2/apache-tomcat-9.0.12/bin/shutdown.sh &
#kill $PID
#pkill chrome
#echo "Finished"
#exit