class Chat {
    constructor(world_id, map_id, room_id, player_id, player_name, player_icon) {
        this.info = {
            worldID: world_id,
            mapID: map_id,
            roomID: room_id,
            player: new Player(player_id, player_name, player_icon)
        }
        this.svg = {
            close: `<path d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z"></path>`,
            send: `<path d="M3.5 1.3457C3.58425 1.3457 3.66714 1.36699 3.74096 1.4076L22.2034 11.562C22.4454 11.695 22.5337 11.9991 22.4006 12.241C22.3549 12.3241 22.2865 12.3925 22.2034 12.4382L3.74096 22.5925C3.499 22.7256 3.19497 22.6374 3.06189 22.3954C3.02129 22.3216 3 22.2387 3 22.1544V1.8457C3 1.56956 3.22386 1.3457 3.5 1.3457ZM5 4.38261V11.0001H10V13.0001H5V19.6175L18.8499 12.0001L5 4.38261Z"></path>`,
        }
        this.timeline = [];
    }

//@Public
// 入室
    joinRoom() {
    // すでにチャットがあれば再生成
        if ($("#ChatWindow").length) {
            $("#ChatWindow").remove();
        }
        this._create_chat_window();
    // チャットボタンのUI表示
        $(".chat_area").removeClass("hidden");
    // チャットボタンのイベント再設定
        $("#ChatButton").off("click");
        $("#ChatButton").on("click", this._click_chat_btn);
    // ソケット設定
        socket.on('chat-msg', this._receive_chat);
        socket.on('chat-msg-all-return', this._receive_all_chat);
        socket.emit('chat-msg-all', {MapID: this.info.mapID, RoomID: this.info.roomID, PlayerID: this.info.player})
    }

// 退室
    leaveRoom(){
    // すでにチャットがあれば削除
        if ($("#ChatWindow").length) {
            $("#ChatWindow").remove();
        }
    // チャットボタンのUI非表示
        $(".chat_area").addClass("hidden");
        $("#ChatButton").attr("fill", "white");
    // ソケットリセット
        socket.off('chat-msg', this._receive_chat);
        socket.off('chat-msg-all-return', this._receive_all_chat);
    }

//@Private
// チャットボタンクリック
    _click_chat_btn = () => {
        if ($("#ChatWindow").css("display") == "none") {
            $("#ChatWindow").css("display","flex");
            $("#ChatButton").attr("fill", "#b8f6ff");
        } else {
            $("#ChatWindow").css("display", "none");
            $("#ChatButton").attr("fill", "white");
        }
    }

// 送信ボタンクリック
    _click_send_btn = () => {
        const Text = $("#ChatTextField").val();
        if (Text == "") return;
        const Message = new ChatMessage(this.info.mapID, this.info.roomID, this.info.player.id, Text);
        socket.emit("chat-msg", Message);
        $("#ChatTextField").val("");
    }

// チャットウィンドウ生成
    _create_chat_window = () => {
        let chatWindow = $(`
            <div id="ChatWindow">
                <div id="ChatWindowHeader">
                    <div>${this.info.roomID}のチャット</div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="10%" id="ChatWindowCloseBtn" viewBox="0 0 24 24">${this.svg.close}</svg>
                </div>
                <div id="ChatWindowBody">
                    <ul id="ChatTimeline"></ul>
                </div>
                <div id="ChatWindowFooter">
                    <input id="ChatTextField" type="text" name="chat" class="chat-value chatFormTextFormField" required>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="10%" id="ChatSendBtn" viewBox="0 0 24 24">${this.svg.send}</svg>
                </div>
            </div>
        `);
        $("footer").before(chatWindow);
        $("#ChatWindowCloseBtn").on("click", this._click_chat_btn);
        $("#ChatSendBtn").on("click", this._click_send_btn);
    }

// ソケットイベント
    // 最初にチャットのデータを受け取る
    _receive_all_chat = (data) => {
        if(data.player_id != this.info.player) return;
        data.chat.forEach(obj => {
            if (obj.source === 0) {
                let newLi = $(`
                    <li class="chat-msg-li">
                        <div class="chat-msg-header">
                            <span class="chat-id">${obj.id}</span>
                            <span class="chat-date">${obj.date}</span>
                        </div>
                        <div class="chat-msg"><span>${obj.value}</span></div>
                    </li>`);
                $("#ChatTimeline").append(newLi);
            }
        });
        console.log(data);
    }

    // チャットをリアルタイムで受け取る
    _receive_chat = (data) => {
        if (data.source !== 0) return;
        let newLi = $(`
            <li class="chat-msg-li">
                <div class="chat-msg-header">
                    <span class="chat-id">${data.id}</span>
                    <span class="chat-date">${data.date}</span>
                </div>
                <div class="chat-msg"><span>${data.value}</span></div>
            </li>`);
        $("#ChatTimeline").append(newLi);
    }

    // ルームにいる人数を受け取る
    _receive_in_room_count = async (data) => {
        this.in_room_count = data.count;
    }
}