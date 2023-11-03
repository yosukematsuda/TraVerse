let newChatDom;
let chatSocket_flg = 0;
let inRoom = 0;
let roomIDg;

function chatJoinRoom(roomID) {
    roomIDg = roomID;
    inRoom = 1;
    if (newChatDom) newChatDom.empty();

    newChatDom = $('<ul class="chat-timeline"></ul><div id="unknown"><div class="chat-form"><input type="text" name="chat" class="chat-value chatFormTextFormField" required><button class="chat-send my_japanese_font buttonStyle">送信</button></div></div>');
    // 要素にルームIDを追加してhtmlに追加
    newChatDom.attr({ id: roomID }).appendTo('#chatForm');
    // チャット送信イベントの設定
    $(`#${roomID} .chat-send`).on("click", function (e) {
        console.log(e);
        e.preventDefault();
        let target = $(".chat-value")[0];
        let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
        socket.emit("chat-msg", { roomID: roomIDg, id: myID, value: target.value, date: date, MapID: MapID, source: 0 });
        target.value = "";
    });

    if (chatSocket_flg === 0) {
        socket.on("chat-msg", function (msg) {
            if (msg.source !== 0) return;
            // チャットをリアルタイムで取得
            let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
            let newLi = $(`<li class="chat-msg-li"><span class="chat-id">${msg.id}</span><span class="chat-msg">${msg.value}</span><span class="chat-date">${msg.date}</span></li>`);
            newLi.appendTo(`#chatForm .chat-timeline`);
        });
        chatSocket_flg = 1;
    }
    socket.emit("chat-msg-all", roomID);
}

socket.on("chat-msg-all-return", function (msg) {
    msg.forEach(obj => {
        if (obj.source === 0) {
            let newLi = $(`<li class="chat-msg-li"><span class="chat-id">${obj.id}</span><span class="chat-msg">${obj.value}</span><span class="chat-date">${obj.date}</span></li>`);
            newLi.appendTo(`#chatForm .chat-timeline`);
        }
    });
    console.log(msg);
});

function chatLeaveRoom(playerCount) {
    if (playerCount === 1) {
        let save_mode = 0;
        gKey[65] = gKey[87] = gKey[68] = gKey[83] = 0;
        let save_talk_res = window.confirm('会話内容を保存しますか？');
        if (save_talk_res) {
            save_mode = 1;
            let save_summary_res = window.confirm('会話内容を要約しますか？');
            if (save_summary_res) {
                save_mode = 2;
            }
        }
        socket.emit("chat-msg-save", { roomID: roomIDg, MapID: MapID, saveMode: save_mode });
    }
    inRoom = 0;
    newChatDom.remove();
}