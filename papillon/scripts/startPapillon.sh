#!/bin/bash

if [ $# -ne 2 ]; then
    echo "$0": usage: startPapillon tag browserPath
    exit 1
fi

echo "TAG = $1"
echo "Browser = $2"
echo "starting apache server"
sh ~/enterprise-papillon-v5.2/apache-tomcat-9.0.12/bin/startup.sh &
echo "allowing server to start..."
sleep 10
echo "starting papillon..."
java -jar ~/enterprise-papillon-v5.2/papillon_client/client.jar &
PID=$!
echo "$PID"
sleep 10
echo "Tagging $3"
PAPILLON_TAG="$2" "$3" --remote-debugging-port=21222 &
sleep 30
echo "sleeping for experiment duration"
sleep 80
sh ~/enterprise-papillon-v5.2/apache-tomcat-9.0.12/bin/shutdown.sh &
kill $PID
pkill firefox
echo "Finished"
exit