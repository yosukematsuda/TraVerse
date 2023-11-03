// deepl
const DEEPL_API_KEY = 'your API key' ;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
let useDeepL = 1;

// 音声検知　設定
let isJapanese=false;
let sourceLang="";
SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
let recognition = new SpeechRecognition();
let speech_flg = -1;

function startSpeechInit(roomName){
    startSpeech(roomName);
}

// ルーム入室時
function startSpeech(roomName){
    console.log("function startSpeech()");
    recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onerror = (event) => {
        console.error(event.error);
        if(speech_flg == 0){
            startSpeech(roomName);
        }
    }
    recognition.onsoundend = function() {
        if(speech_flg == 0){
            console.log("onsounded");
            startSpeech(roomName);
        }
    };

    recognition.onresult = (event) => {
        if (audioOn){
            for (let i = event.resultIndex; i < event.results.length; i++) {
                let transcript = event.results[i][0].transcript;
                if (transcript == "") {
                    continue;
                }
                if (event.results[i].isFinal) {
                    let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
                    // 送信
                    socket.emit("talk-confirm", { MapID: MapID, roomID: roomName, myID: myName, value: transcript, date: date, source: 1 });
                } else {
                    socket.emit("talking", { MapID: MapID, roomID: roomName, myID: myName, value: transcript });
                    speech_flg = 1;
                }
            }
        }
        
    }
    speech_flg = 0;
    recognition.start();
}

// ルーム退出時
function stopSpeech(){
    recognition.stop();
    speech_flg = -1;
}

function deeplOutput(deeplInput, playerID) {
    for(var i=0; i < deeplInput.length; i++){//言語判別
        if(deeplInput.charCodeAt(i) >= 256) {
            isJapanese = true;
            break;
        }
    }
    switch (isJapanese){
    case true:
        sourceLang='&source_lang=JA&target_lang=EN';
        break;
    case false:
        sourceLang='&source_lang=EN&target_lang=JA';
        break;
    default:
        alert("言語の判別に失敗しました");
    }
    let content = encodeURI('auth_key=' + DEEPL_API_KEY + '&text=' + deeplInput + sourceLang);
    let url = DEEPL_API_URL + '?' + content;
    let deeplOutput = "";

    fetch(url).then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Could not reach the API: " + response.statusText);
        }
    }).then(function(data) {
        deeplOutput = data.translations[0].text;
        console.log("翻訳|" + playerID + ":" + deeplOutput);
        $("#transcriptEN").html(`<font color='black'>${playerID}:${deeplOutput}</font>`);
    }).catch(function(error) {
        console.log("翻訳失敗");
    });
    console.log(deeplOutput);
    return deeplOutput;
};

// データ受信
socket.on("talking-return", function (data) {
    if(speech_flg === -1) return;
    console.log("未確定|" + data.id + ":" + data.value);
    $("#transcript").html(`<font color='gray'>${data.id}:${data.value}</font>`);
});
socket.on("talk-confirm-return", function (data) {
    if (speech_flg === -1) return;
    console.log("確定|" + data.id + ":" + data.value);
    $("#transcript").html(`<font color='black'>${data.id}:${data.value}</font>`);
    if(useDeepL === 1){
        new Promise((resolve)=>{
            let translation = deeplOutput(data.value, data.id);
            resolve(translation);
        }).then((translation)=>{
            //console.log("翻訳|" + data.id + ":" + translation);
        }).catch((err)=>{
            console.error(err);
        })
    }
});
