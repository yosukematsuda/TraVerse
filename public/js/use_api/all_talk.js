function talk_list_render(data){
    Object.keys(data).forEach(function (room) {
        let room_talk_list_elm = $(`<div id="talkList-${room}"><p><small>${room}</small></p></div>`);
        let room_talk_list = data[room];
        let room_summary_list = All_Sumarry[room];
        room_talk_list.forEach((talk_name)=>{
            let title = encode_talk_list(talk_name);
            // 要約ファイルはtxtなのでjsonをtxtに置換
            let summary_name = talk_name.replace("json", "txt");
            if (room_summary_list.indexOf(summary_name) !== -1){
                // 要約ファイルがあるとき
                $(`<div class"call_talk_api">${title} <span class="detail_talk detail_btn" data-room="${room}" data-date="${talk_name}">会話</span> <span class="detail_summary detail_btn" data-room="${room}" data-date="${summary_name}">要約</span></div>`).appendTo(room_talk_list_elm);
            }else{
                // 要約ファイルがないとき
                $(`<div class"call_talk_api">${title} <span class="detail_talk detail_btn" data-room="${room}" data-date="${talk_name}">会話</span></div>`).appendTo(room_talk_list_elm);
            }
        });

        room_talk_list_elm.appendTo("#talkList");
    });

// クリックイベントを設定
    $(".detail_talk").on('click', click_detail_talk);
    $(".detail_summary").on('click', click_detail_summary);
}

// ファイル名を見やすいように変換
function encode_talk_list(title){
    let str_array = title.split("-");
    title = `${str_array[0]}年${str_array[1]}月${str_array[2]}日${str_array[3]}時${str_array[4]}分`;
    return title;
}

// 会話内容を表示
function click_detail_talk(){
    let room = $(this).data("room");
    let date = $(this).data("date");
    new Promise((resolve) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/api/talk-data?world=${World_ID}&map=${MapID}&room=${room}&date=${date}`, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                let result = JSON.parse(xhr.responseText);
                create_detail_window(encode_talk_list(date), JSON.parse(result), 0);
                resolve();
            } else {
                console.error('Request failed. Status:', xhr.status);
            }
        };
        xhr.send();
    });
}
// 要約内容を表示
function click_detail_summary(){
    let room = $(this).data("room");
    let date = $(this).data("date");
    new Promise((resolve) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/api/summary-data?world=${World_ID}&map=${MapID}&room=${room}&date=${date}`, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                let result = JSON.parse(xhr.responseText);
                create_detail_window(encode_talk_list(date), result, 1);
                resolve();
            } else {
                console.error('Request failed. Status:', xhr.status);
            }
        };
        xhr.send();
    });
}
// ウィンドウを作成
function create_detail_window(title, data, mode){
    let text;
    if(mode === 0){
        title = `${title}の会話`;
        text = encode_talk(data);
    }else{
        title = `${title}の要約`;
        text = data;
    }
    let detail_window = $(`<div id="detailWindow"><h3>${title}</h3>${text}</div><div id="detailMask"></div>`);
    detail_window.appendTo('body');
    $("#detailMask").on('click', function(){
        detail_window.remove();
    });    
}

// 会話をエンコード
function encode_talk(data){
    let array = data['data'];
    let result = "";
    array.forEach((e)=>{
        result = result + e.id + ":" + e.value + "<br>";
    });
    return result;
}