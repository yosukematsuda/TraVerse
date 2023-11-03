function getChannel(WorldID){
// 閲覧中のスレッドチャンネル
    let current_channel_id;
// メッセージ格納配列
    let channel_messages = [];
// チャンネル一覧を取得
    new Promise((resolve) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/api/get-channel?world=${WorldID}`, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                let result = JSON.parse(xhr.responseText);
                resolve(result);
            } else {
                console.error('Request failed. Status:', xhr.status);
            }
        };
        xhr.send();
    }).then((result)=>{
        const Threads = result.thread;
        if(Threads.length === 0) return;
        // チャンネルごとに回す
        Threads.forEach((channel)=>{
            let elm = $(`<option class="channel" value="${channel.ChannelID}">${channel.ChannelName}</option>`);
            elm.appendTo("#selectBox");
        });
        $("#selectBox").on('change', click_detail_channel);
    });
// チャンネルクリック時
    function click_detail_channel(){
        var ChannelID = $(this).val();
        console.log(ChannelID);
    // クリックイベントリセット
        $(".channel").on('click', click_detail_channel);
        $(this).off('click', click_detail_channel);
        // const ChannelID = $(this).data("channel");
        new Promise((resolve) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', `/api/get-detail-channel?channel=${ChannelID}`, true);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    let result = JSON.parse(xhr.responseText);
                    console.log(result);
                    resolve(result);
                } else {
                    console.error('Request failed. Status:', xhr.status);
                }
            };
            xhr.send();
        }).then((result)=>{
            current_channel_id = ChannelID;
            const Item = result.Item;
        // チャット欄を初期化
            $("#threadRight").empty();
        // チャット欄を作成
            // チャンネルタイトル
            // let channel_title = $(`<div id="ChannelTitle" data-channel="${ChannelID}">${Item.channel_name.S}</div>`);
            // チャット履歴
            let channel_content = $(`<div id="ChannelContent" class='leftMargin chatTopMargin scroll chatSpace'>${showChannelChat(Item.messages.M)}</div>`);
            // チャット送信枠
            let channel_chat_frame = `
                <div id='ChannelChatFrame' class='textFormFieldPoint flex'>
                <input type='text' name='channelChatContent' id='channelChatContent' class='textFormField'>
                <input type='submit' value='送信' id='channelChatSend' class='btn-submit center my_japanese_font'>
                </div>);
            `;
            channel_chat_frame = $(channel_chat_frame);
            // 要素に追加
            // channel_title.appendTo("#threadRight");
            channel_content.appendTo("#threadRight");
            channel_chat_frame.appendTo("#threadRight");
            $("#channelChatSend").on('click', click_thread_send_message);
            $(".thread_message").on('click', click_detail_message);
            $("#threadRight").removeClass("hidden");
        });
    }

// チャット履歴整理
    function showChannelChat(messages){
        if (Object.keys(messages).length === 0) return "";
        let message_elment = "";
    // メッセージごとに回す
        Object.keys(messages).forEach(function (message_id) {
            let replies = [];
        // リプライごとに回す
            Object.keys(messages[message_id].M.reply.M).forEach(function (reply_id) {
                let push_reply = {
                    reply_id: reply_id,
                    user_id: messages[message_id].M.reply.M[reply_id].M.user_id.S,
                    value: messages[message_id].M.reply.M[reply_id].M.value.S,
                    created_at: messages[message_id].M.reply.M[reply_id].M.reply_created_at.S,
                    updated_at: messages[message_id].M.reply.M[reply_id].M.reply_updated_at.S,
                }
                replies.push(push_reply);
            });

            let push_message = {
                message_id: message_id,
                user_id: messages[message_id].M.user_id.S,
                value: messages[message_id].M.value.S,
                reply: replies,
                created_at: messages[message_id].M.message_created_at.S,
                updated_at: messages[message_id].M.message_updated_at.S,
            }
            channel_messages.push(push_message);
            if (replies.length !== 0){
                message_elment += `<div class="thread_message_wrapper" data-message="${message_id}">
                                        <div class="thread_message flex" data-message="${message_id}">
                                            <div class='nameFont'>${push_message.user_id}　:　</div>
                                            <div class='chatFont'>${push_message.value}　:　</div>
                                            <br>
                                            <div class='replyNumberFont'>${replies.length}件の返信</div>
                                        </div>
                                    </div>`;
            }else{
                message_elment += `<div class="thread_message_wrapper" data-message="${message_id}">
                                        <div class="thread_message flex" data-message="${message_id}">
                                            <div class='nameFont'>${push_message.user_id}　:　</div>
                                            <div class='chatFont'>${push_message.value}</div>
                                        </div>
                                    </div>`;
            }
        });
        console.log(channel_messages);
        return message_elment;
    }

// メッセージクリック時
    function click_detail_message(){
        $("#messageReply").remove();
        const MessageID = $(this).data("message");
        const ReplyElements = $(`<div id="messageReply" data-message="${MessageID}"></div>`);
        const Replies = (channel_messages.find(message => message.message_id == MessageID)).reply;
        console.log(Replies);
        let reply_element = "";
    // リプライがある場合
        if (Replies.length !== 0){
            Replies.forEach((reply) => {
                reply_element += `<div class="thread_reply replyLeftMarginn flex" data-reply="${reply.reply_id}">>>>
                                    <div class='replyNameFont'>${reply.user_id}　:　</div>
                                    <div class='replyChatFont'>${reply.value}</div>
                                </div>`;
            })
            reply_element = $(reply_element);
        }
    // リプライ送信枠
        let reply_chat_frame = `
                <div id='ReplyChatFrame' class='replyLeftMargin flex'>
                <input type='text' name='channelReplyContent' id='channelReplyContent' class='replyTextFormField'>
                <input type='submit' value='送信' id='channelReplySend' class='reply-btn-submit center my_japanese_font'>
                </div>;
        `;
        reply_chat_frame = $(reply_chat_frame);
    // 要素に追加
        if (reply_element){
            reply_element.appendTo(ReplyElements);
        }
        reply_chat_frame.appendTo(ReplyElements);
        ReplyElements.appendTo($(this).parent());
    // イベント設定
        $("#channelReplySend").on('click', click_thread_send_reply);
    }


// メッセージ送信
    function click_thread_send_message(){
        var ChannelID = $("#selectBox").val();
        let value = $("#channelChatContent").val();
        if(value == "") return;
        // const ChannelID = $("#ChannelTitle").data("channel");
        $("#channelChatContent").val("");
        console.log({ WorldID: World_ID, ChannelID: ChannelID, UserID: myID, value: value });
        socket.emit("thread-send-message", { WorldID: World_ID, ChannelID: ChannelID, UserID: myID, value: value });
    }
// リプライ送信
    function click_thread_send_reply(){
        var ChannelID = $("#selectBox").val();
        let value = $("#channelReplyContent").val();
        if(value == "") return;
        // const ChannelID = $("#ChannelTitle").data("channel");
        const MessageID = $("#messageReply").data("message");
        $("#channelReplyContent").val("");
        socket.emit("thread-send-reply", { WorldID: World_ID, ChannelID: ChannelID, MessageID: MessageID, UserID: myID, value: value });
    }
// メッセージ受信
    socket.on("thread-commit-message", function (data) {
        console.log(data);
        if (data.channel_id == current_channel_id){
            let push_message = {
                message_id: data.message_id,
                user_id: data.user_id,
                value: data.value,
                reply: data.reply,
                created_at: data.message_created_at,
                updated_at: data.message_updated_at,
            }
            channel_messages.push(push_message);
            let message_element = $(`<div class="thread_message" data-message="${push_message.message_id}">
                                        <div class='nameFont'>${push_message.user_id}　:　</div>
                                        <div class='chatFont'>${push_message.value}</div>
                                    </div>`);
            message_element.appendTo("#ChannelContent");
        }
    });
// リプライ受信
    socket.on("thread-commit-reply", function (data) {
        if (data.channel_id == current_channel_id) {
            let push_reply = {
                reply_id: data.reply_id,
                user_id: data.user_id,
                value: data.value,
                created_at: data.reply_created_at,
                updated_at: data.reply_updated_at,
            }
            let index = channel_messages.findIndex(({ message_id }) => message_id == data.message_id);
            channel_messages[index].reply.push(push_reply);
            let reply_element = $(`<div class="thread_reply replyLeftMarginn flex" data-reply="${data.reply_id}">>>>
                                    <div class='replyNameFont'>${data.user_id}　:　</div>
                                    <div class='replyChatFont'>${data.value}</div>
                                </div>`);
            reply_element.insertBefore("#ReplyChatFrame");
        }
    });
}

