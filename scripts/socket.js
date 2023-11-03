const fs = require('fs');
require('date-utils');
const LeaveRoom = require('./socket/leave_room.js');
const ThreadSendMessage = require('./socket/thread_send_message.js');
const ThreadSendReply = require('./socket/thread_send_reply.js');

let io;
function init(set_io) {
    io = set_io;
    main();
}

function main() {
    class Player {
        constructor(obj = {}) {
            this.id = Math.floor(Math.random() * 1000000000);
            this.x = 15;  //player X初期位置
            this.y = 17;  //player Y初期位置
            this.angle = 0;  //player 向き
            this.move = 0;
            this.MapID = null;
            this.playerID = null;
            this.playerName = null;
            this.icon = null;
        }
    };
    let players = {};
    let participant_list = {}; //通話ルーム参加者
    let chat = [];
    let whiteboard = [];
    io.on('connection', function (socket) {
        let player = null;
        socket.on('meta-start', (data) => {
            player = new Player({
                socketId: socket.id,
            });
            player.playerID = data.myID;
            player.playerName = data.myName;
            player.MapID = data.MapID;
            player.icon = data.myIcon;
            player.x = data.player_x;
            player.y = data.player_y;
            player.angle = data.player_angle;
            players[player.id] = player;
            socket.join(data.MapID);
            socket.join(data.WorldID);
            io.to(data.MapID).emit('list', players);
            io.to(data.MapID).emit('state', players);
        });
        socket.on('movement', function (p) {
            if (!p) { return; }
            player.x = p.player_x;
            player.y = p.player_y;
            player.angle = p.player_angle;
            player.move = p.player_move;
            let filters = Object.values(players).filter(function (map_player) {
                return map_player.MapID === player.MapID;
            });
            io.to(player.MapID).emit('state', filters);
        });
        socket.on('move-judge', function(move_judge){
            if (!player) { return; }
            player.move = move_judge;
        });
        socket.on('disconnect', () => {
            if (!player) { return; }
            let MapID = player.MapID;
            delete players[player.id];
            io.to(player.MapID).emit('list', players);
            player = null;
            socket.leave(MapID);
        });
        socket.on('change-map', function(cd){
            socket.leave(player.MapID);
            let before_filter = Object.values(players).filter(function (before_player) {
                return before_player.MapID === player.MapID;
            });
            io.to(player.MapID).emit('state', before_filter);
            player.MapID = cd.MapID;
            player.x = cd.player_x;
            player.y = cd.player_y;
            player.angle = cd.angle;
            socket.join(cd.MapID);
            let after_filter = Object.values(players).filter(function (map_player) {
                return map_player.MapID === player.MapID;
            });
            io.to(player.MapID).emit('state', after_filter);
        });
        socket.on('PeerID', function (peerid) {
            player.PeerID = peerid;
        });
    // 通話接続 -----------------------------------------------
        socket.on('start-call', function(data){
            socket.join(data.RoomID);
            let key = `${data.MapID}-${data.RoomID}`;
            if (!participant_list[key]){
                participant_list[key] = [];
            }
            if (!participant_list[key].some(p => JSON.stringify(p) == JSON.stringify(data.player))){
                participant_list[key].push(data.player);
            }
            io.to(data.RoomID).emit('call-participant-list', { participant: participant_list[key] });
        });
        socket.on('stop-call', function(data){
            socket.leave(data.RoomID);
            let key = `${data.MapID}-${data.RoomID}`;
            participant_list[key] = participant_list[key].filter(p => p.id != data.player.id);
            io.to(data.RoomID).emit('call-participant-list', { participant: participant_list[key] });
        });
        socket.on('request-call-participant-list', function(data){
            let key = `${data.MapID}-${data.RoomID}`;
            io.to(data.RoomID).emit('call-participant-list', { participant: participant_list[key] });
        });


    // チャット -----------------------------------------------
        // チャット送受信
        socket.on('chat-msg', function (data) {
            let returnData = pushChat(data);
            io.to(data.roomID).emit('chat-msg', returnData);
        });
        // ルーム接続時にチャットを全て渡す
        socket.on('chat-msg-all', function (data) {
            let key = `${data.MapID}-${data.RoomID}`;
            try {
                if (chat[key]) {
                    io.to(data.RoomID).emit('chat-msg-all-return', {player_id: data.PlayerID, chat:chat[key]});
                } else {
                    chat[key] = []; // ルームにチャット履歴がない時
                }
            } catch (err) {
                console.error(err);
            }
        });
        // 全員退出時にチャットを保存
        socket.on('chat-msg-save', async function (data) {
            let key = `${data.MapID}-${data.RoomID}`;

            let saveMode = data.saveMode;
            if (whiteboard[key]) whiteboard[key] = [];
            if (!chat[key] || chat[key].length === 0 || chat[key] == []) {
                return;
            }
            if (saveMode === 0) {
                chat[key] = [];
                return;
            }
            await LeaveRoom(data.WorldID, data.MapID, data.RoomID, chat[key]);
            chat[key] = [];
        });
    // 文字おこし -----------------------------------------------
        // 文字起こし 文字確定前
        socket.on('talking', function (data) {
            let sendData = {
                id: data.myID,
                value: data.value
            }
            io.to(player.MapID).emit('talking-return', sendData);
        });
        // 文字起こし 文字確定
        socket.on('talk-confirm', function (data) {
            let returnData = pushChat(data);
            io.to(player.MapID).emit('talk-confirm-return', returnData);
        });
    // ホワイトボード
        socket.on('whiteboard-drawing', function(data){
            pushWhiteBoard(data);
            io.to(player.RoomID).emit('whiteboard-drawing', data);
        });
        socket.on('whiteboard-get', function(data){
            let key = `${data.MapID}-${data.RoomID}`;
            try {
                if (whiteboard[key]) {
                    socket.emit('return-whiteboard-get', whiteboard[key]);
                } else {
                    whiteboard[key] = []; // ルームにホワイトボード履歴がない時
                }
            } catch (err) {
                console.error(err);
            }
        });
        socket.on('whiteboard-reset', function (data) {
            let key = `${data.MapID}-${data.RoomID}`;
            whiteboard[key] = [];
            io.to(player.RoomID).emit('whiteboard-reset', { roomID: data.roomID });
        });
    // マップ編集 -----------------------------------------------
    socket.on("edit-data", function (edit) {
        edit.map_data = JSON.stringify(edit.map_data);
        fs.writeFileSync('public/data_map/'+ edit.world_id + '/' + edit.map_id + '.json', edit.map_data);
    });
    // マップ追加 -----------------------------------------------
        socket.on("add-data", function (add) {
            add.map_data = JSON.stringify(add.map_data);
            fs.writeFileSync('public/data_map/'+ add.world_id + '/' + add.new_map_id + '.json', add.map_data);
    });
    //マップ作成 ------------------------------------------------
        socket.on('emit-data', function(data){
            const mkdir = fs.mkdirSync('public/data_map/' + data.new_world_id);
            Promise.all([mkdir]).then(() => {
                data.map_data = JSON.stringify(data.map_data);
                fs.writeFileSync('public/data_map/'+ data.new_world_id + '/' + data.map_id + '.json', data.map_data);
            });
        });
// スレッド
    // メッセージ
        socket.on('thread-send-message', async function (data) {
            let result = await ThreadSendMessage(data.ChannelID, data.UserID, data.value);
            if (result.result == true){
                io.to(data.WorldID).emit('thread-commit-message', result);
            }
        });
    // リプライ
        socket.on('thread-send-reply', async function (data) {
            let result = await ThreadSendReply(data.ChannelID, data.UserID, data.value, data.MessageID);
            if(result.result == true){
                io.to(data.WorldID).emit('thread-commit-reply', result);
            }
        });
    });

    // function -----------------------------------------------
    function pushChat(d) {
        let pushData = {
            id: d.playerID,
            value: d.text,
            date: d.date,
            source: d.source
        }
        let key = `${d.mapID}-${d.roomID}`;
        // チャットの配列がない時
        if (!chat[key]) {
            chat[key] = [];
        }
        chat[key].push(pushData);
        return pushData;
    }

    function pushWhiteBoard(d){
        if(!whiteboard[d.roomID]){
            whiteboard[d.roomID] = [];
        }
        whiteboard[d.roomID].push(d);
    }
}

module.exports = { init }