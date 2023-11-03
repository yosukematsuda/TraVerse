#!/bin/bash

# ログファイル
LOG_FILE="/home/ec2-user/fd/node_observer.log"

RESULT=$(ps -A | grep node | tr -d ' ')

if [ -n "$RESULT" ]; then
    DATE=$(TZ='Asia/Tokyo' date +'%Y-%m-%d %H:%M:%S')
    echo "$DATE" >> "$LOG_FILE" 2>&1 &
fi
