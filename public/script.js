$(function(){
    const startBtn = document.querySelector('#start-btn');
    const stopBtn = document.querySelector('#stop-btn');
    const resultDiv_JA = document.querySelector('#result-div-ja');
    const resultDiv_US = document.querySelector('#result-div-us');
    var flg_speech = 0;
    var id = 0;
            // deepl
    const DEEPL_API_KEY = 'your API key' ;
    const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
    let isJapanese=false;
    let sourceLang="";

    function startSpeech(){
        console.log("start");
        SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
        let recognition = new SpeechRecognition();

        recognition.lang = 'ja-JP';
        recognition.interimResults = true;
        recognition.continuous = true;

        // // デバッグ用
        // recognition.onsoundstart = function() {
        //     document.getElementById('status').innerHTML = "認識中";
        // };
        // recognition.onnomatch = function() {
        //     document.getElementById('status').innerHTML = "もう一度試してください";
        // };
        // recognition.onerror = function() {
        //     document.getElementById('status').innerHTML = "エラー";
        //     if(flg_speech == 0)
        //     startSpeech();
        // };
        // recognition.onsoundend = function() {
        //     document.getElementById('status').innerHTML = "停止中";
        //     startSpeech();
        // };

        let finalTranscript = ''; // 確定した(黒の)認識結果

        recognition.onresult = (event) => {
            let interimTranscript = ''; // 暫定(灰色)の認識結果
            for (let i = event.resultIndex; i < event.results.length; i++) {
                let transcript = event.results[i][0].transcript;
                console.log("transcript:" + transcript);
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    startSpeech();
                } else {
                    interimTranscript = transcript;
                    flg_speech = 1;
                }
            }

            //resultDiv.innerHTML = finalTranscript + '<i style="color:#ddd;">' + interimTranscript + '</i>';
            console.log("finalTranscript:" + finalTranscript);
            writeJson(finalTranscript);
            console.log(event);

            //finalTranscript = "";
        }
        flg_speech = 0;
        recognition.start();
    }
    console.log("0");


    // startBtn.onclick = () => {
    //     startSpeech();
    // }
    // stopBtn.onclick = () => {
    //     recognition.stop();
    // }
    console.log("1");

    
    console.log("3");

    ////////////////////通話エリアを黄色に/////////////////////////////
        const call_size= 7;
        var l;
        var m;
        var call_cell;
    
        for (l= 10 - 1 - call_size; l <= call_size; l++) {
            for (m= 10 - 1 - call_size; m <= call_size; m++) {
                call_cell= document.getElementById("squareTable").rows[l].cells[m];
                call_cell.classList.add("yellow");
                call_cell.setAttribute("value", "call_id_001");
                call_cell.setAttribute("id", "call_id_001");
            }
        }
    
    //////////////////////////////////////////////////////////////////
    
    
    ////////////////////現在地を赤色に/////////////////////////////////
        //初期位置//
        var redRow = 0;
        var redCol = 0;
        var redCell = document.getElementById("squareTable").rows[redRow].cells[redCol];
        redCell.classList.add("red");
    
        var oldRedCell;
        var newRedCell;
        var keyCode;
        var newRedRow;
        var newRedCol;
        var call_judge = 0;
        var first_call = 0;
    
        let localStream = null;
        let peer = null;
        let existingCall = null;
        let remoteStream = null;
        let recorder = null;
        let audioSelect = $('#audioSource');
        let videoSelect = $('#videoSource');
    
        ///////////通話開始////////////
        function start_call(){
            let roomName = $('#call_id_001').selector;
                if (!roomName) {
                    return;
                }
                
                const call = peer.joinRoom(roomName, {mode: 'sfu', stream: localStream});
                setupCallEventHandlers(call);
                startSpeech();
        };
    
    
        ///////////
        ///ボタンを押されたら反応/////////
        document.addEventListener("keydown", function(event) {
            call_judge += 0;
            first_call += 0;
            // ("#room_id").insertAdjacentHTML("beforeend","call_id_001");
    
            keyCode = event.keyCode;
            newRedRow = redRow;
            newRedCol = redCol;
            //入力別・変数変化
            switch(keyCode) {
                case 37: // 左
                    newRedCol--;
                    break;
                case 38: // 上
                    newRedRow--;
                    break;
                case 39: // 右
                    newRedCol++;
                    break;
                case 40: // 下
                    newRedRow++;
                    break;
                default:
                    return;
            }
    
            //範囲
            var size = 10;
    
            //範囲外にいかないようにする
            if (newRedRow < 0 || newRedRow >= size || newRedCol < 0 || newRedCol >= size) {
                return;
            }
    
            oldRedCell= document.getElementById("squareTable").rows[redRow].cells[redCol];
            //もしすでにオレンジのクラスがあるのなら消す。なければ赤を消す。
            if(oldRedCell.classList.contains("orange")){
                oldRedCell.classList.remove("orange");
                call_cell.removeAttribute("id", "call_id_001"); //////////////
                oldRedCell.classList.add("yellow");
                call_judge = 0;
            }else{
                oldRedCell.classList.remove("red");
            }
    
            newRedCell= document.getElementById("squareTable").rows[newRedRow].cells[newRedCol];
            //もしすでに黄色のクラスがあるのならオレンジに。なければ赤に。
            if(newRedCell.classList.contains("yellow")){
                newRedCell.classList.add("orange");
                call_cell.setAttribute("id", "call_id_001"); /////////
                newRedCell.classList.remove("yellow");
                call_judge = 1;
            }else{
                newRedCell.classList.add("red");
            }
            redRow = newRedRow;
            redCol = newRedCol;
    
            if(first_call == 0 && call_judge == 1){
                first_call = 1;
                start_call();
                console.log("test");
            }else if(first_call == 1 && call_judge == 0){
                stop_call();
                first_call = 0;
                console.log(first_call);
            }
    
        });
            /////////////////////////////////
    //////////////////////////////////////////////////////////////////
    
    
        navigator.mediaDevices.enumerateDevices()
            .then(function(deviceInfos) {
                for (let i = 0; i !== deviceInfos.length; ++i) {
                    let deviceInfo = deviceInfos[i];
                    let option = $('<option>');
                    option.val(deviceInfo.deviceId);
                    if (deviceInfo.kind === 'audioinput') {
                        option.text(deviceInfo.label);
                        audioSelect.append(option);
                    } else if (deviceInfo.kind === 'videoinput') {
                        option.text(deviceInfo.label);
                        videoSelect.append(option);
                    }
                }
                videoSelect.on('change', setupGetUserMedia);
                audioSelect.on('change', setupGetUserMedia);
                setupGetUserMedia();
            }).catch(function (error) {
                console.error('mediaDevices.enumerateDevices() error:', error);
                return;
            });
    
        peer = new Peer({
            key: 'your API key',
            debug: 3
        });
    
        peer.on('open', function(){
            $('#my-id').text(peer.id);
        });
    
        peer.on('error', function(err){
            alert(err.message);
        });
    
    
    
    
    //////////////////////
    ///////////通話終了////////////
        function stop_call(){
            existingCall.close();
        };
    //////////////////////
    function setupGetUserMedia() {
            let audioSource = $('#audioSource').val();
            let videoSource = $('#videoSource').val();
            let constraints = {
                audio: {deviceId: {exact: audioSource}},
                video: {deviceId: {exact: videoSource}}
            };
            constraints.video.width = {
                min: 320,
                max: 320
            };
            constraints.video.height = {
                min: 240,
                max: 240
            };
    
            if(localStream){
                localStream = null;
            }
    
            navigator.mediaDevices.getUserMedia(constraints)
                .then(function (stream) {
                    $('#myStream').get(0).srcObject = stream;
                    localStream = stream;
    
                    if(existingCall){
                        existingCall.replaceStream(stream);
                    }
    
                }).catch(function (error) {
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
            });
        }
    
        function setupCallEventHandlers(call){
            if (existingCall) {
                existingCall.close();
            };
    
            existingCall = call;
            //SsetupEndCallUI();
            $('#room_id').text("Room ID :" + call.name);
    
            call.on('stream', function(stream){
                addVideo(stream);
                remoteStream = stream;
            });
    
            call.on('removeStream', function(stream){
                removeVideo(stream.peerId);
            });
    
            call.on('peerLeave', function(peerId){
                removeVideo(peerId);
            });
    
            call.on('close', function(){
                removeAllRemoteVideos();
                //setupMakeCallUI();
            });
    
        }
    
        function addVideo(stream){
            const videoDom = $('<video autoplay>');
            videoDom.attr('id',stream.peerId);
            videoDom.get(0).srcObject = stream;
            $('.videosContainer').append(videoDom);
        }
    
        function removeVideo(peerId){
            $('#'+peerId).remove();
        }
    
        function removeAllRemoteVideos(){
            $('.videosContainer').empty();
        }
    
        function writeJson(inputData){
            if(inputData != ""){
                var sendData = { post_data_1:inputData }
                fetch('/post/talk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(sendData)
                })
                .then(response => response.json())
                .then(sendData => {
                    console.log('レスポンス:', sendData);
                })
                .catch(error => {
                    console.error('リクエストエラー:', error);
                });
            }
        }
        // function setupMakeCallUI(){
        //     $('#make-call').show();
        //     $('#end-call').hide();
        //     $('#recording').hide();
        // }
    
        // function setupEndCallUI() {
        //     $('#make-call').hide();
        //     $('#end-call').show();
        //     $('#recording').show();
        // }
    
    });


    