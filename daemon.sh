#!/bin/bash

# プロセスIDファイルのパス
PIDFILE=/home/ec2-user/fd/node_app.pid

# アプリのディレクトリ
APP_DIR=/home/ec2-user/fd

# app.js
APP_ENTRYPOINT=app.js

# Node実行パス
NODE_BIN=/root/.nvm/versions/node/v16.20.0/bin/node

start() {
    DATE=$(TZ='Asia/Tokyo' date +'%Y-%m-%d %H:%M:%S')
    MONTH=$(TZ='Asia/Tokyo' date +'%Y-%m')
    LOG_FILE="/home/ec2-user/fd/node.log"
    OBSERVER_LOG_FILE="/home/ec2-user/fd/node_observer.log"
    
    echo "${DATE} | Node.js 起動中・・・"
    
    if [ -f "$PIDFILE" ]; then
        echo "${DATE} | Node.js は起動しています"
    else
        # Node.jsアプリケーションのデーモン起動
        cd "$APP_DIR" && exec "$NODE_BIN" "$APP_ENTRYPOINT" >> "$LOG_FILE" 2>&1 &
        
        # プロセスIDを保存
        echo $! > "$PIDFILE"
        echo "${DATE} | Node.js 起動完了"
        echo "${DATE} === 再起動 ===" >> "$OBSERVER_LOG_FILE" 2>&1 &
    fi
}


stop() {
    DATE=$(TZ='Asia/Tokyo' date +'%Y-%m-%d %H:%M:%S')
    echo "${DATE} | Node.js 停止中・・・"
    # プロセスIDを読み込み
    if [ -f $PIDFILE ]; then
        PID=$(cat $PIDFILE)
        # プロセス終了
        pkill -F $PIDFILE
        rm $PIDFILE
        echo "${DATE} | Node.js 停止完了"
    else
        echo "${DATE} | Node.js は起動していません"
    fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        start
        ;;
    *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
    ;;
esac
