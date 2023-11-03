// let room, sessionData, myID, myName, myIcon, peer;
let audioSelect = $('#audioSource');
let videoSelect = $('#videoSource');
let existingCall = localStream = null;
let videoOn = audioOn = false;
let count = initJoin = 0;
let MapID, myPeerID, whiteBoard, chat;

// ソケット接続
function metaStart() {
    console.log("socket start");
    socket.emit('meta-start', {
        WorldID: World_ID,
        MapID: MapID,
        myID: myID,
        myName: myName,
        myIcon: myIcon,
        player_x: player_x,
        player_y: player_y,
        player_angle: player_angle
    });
    call_api(World_ID, MapID);
    // SkyWay API
    peer = new Peer({
        key: 'your API key',
        debug: 3
    });

    peer.on('open', function () {
        // 接続した時に自分のpeerIDを取得
        your_ID = sessionData.passport.user.username;
        $('#my-id').text(peer.id);
        myPeerID = peer.id;
        $(".swiper-slide").attr('id', myPeerID);
        socket.emit('PeerID', peer.id);
    });

    peer.on('error', function (err) {
        alert(err.message);
    });
}

// セッション取得
const getSessionData = new Promise((resolve) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/session-data', true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            sessionData = JSON.parse(xhr.responseText);
            myID = sessionData.passport.user.id;
            myName = sessionData.passport.user.username;
            myIcon = sessionData.passport.user.icon;
            console.log(sessionData);
            const socket_start = io(); // meta.jsが遅いです
            MapID = select_value;
            socket_start.on('connect', metaStart);
    

            resolve();
        } else {
            console.error('Request failed. Status:', xhr.status);
        }
    };
    xhr.send();
});

function start_call(call_id, c) {
    initJoin = 1;
    new Promise((resolve) => {
        call_id = String(call_id).split(".")[0];
        let roomName = 'call_id_' + call_id;
        // 接続
        room = peer.joinRoom(roomName, { mode: 'sfu', stream: localStream });
        socket.emit('start-call', { MapID: MapID, RoomID: c, player: new Player(myID, myName, myIcon)});
        // 受け取りイベントを設定
        setupCallEventHandlers(room);
        startRecording(localStream);
        count = $(".videosContainer .swiper-slide").length;
        checkStartCall(count);
        if(c != ""){
            chat = new Chat(World_ID, MapID, c, myID, myName, myIcon);
            chat.joinRoom();
            whiteBoard = new WhiteBoard(MapID, roomName, myID);
            whiteBoard.joinRoom();
            checkMicrophonePermissions().then(hasPermission => {
                if (hasPermission) {
                    startSpeechInit(roomName); //<-翻訳
                }
            });
        }
        resolve();
    })
        .catch(function (error) {
            console.error('start_call() error:', error);
            return;
        });

};

function stop_call(c) {
    if(c != ""){
        // chatLeaveRoom(count);
        existingCall.close();
    }
    // ホワイトボードがあれば
    if (whiteBoard) {
        whiteBoard.leaveRoom();
        whiteBoard = null;
    }
    // チャットがあれば
    if(chat){
        chat.leaveRoom();
        chat = null;
    }
    socket.emit('stop-call', { MapID: MapID, RoomID: c, player: new Player(myID, myName, myIcon) });
    count = $(".videosContainer .swiper-slide").length;
    speech_flg = -1; // ソケット受信フラグ
    checkStopCall();
    $('.room_id').text("");
    stopSpeech();
};

// マイクのアクセス許可を判別する関数
async function checkMicrophonePermissions() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // メディアストリームのトラックを停止
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        return false;
    }
}

// ページを開いた時にデバイス選択のセレクトボックスにデバイスを追加する
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function () {
    navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
        for (let i = 0; i !== deviceInfos.length; ++i) {
            let deviceInfo = deviceInfos[i];
            console.log(deviceInfo);
            // 取得したデバイスが出力用であればcontinue
            if (deviceInfo.kind !== 'audioinput' && deviceInfo.kind !== 'videoinput') continue;

            // 追加するオプションタグ生成
            let option = $('<option>');
            option.val(deviceInfo.deviceId);
            option.text(deviceInfo.label);

            if (deviceInfo.kind === 'audioinput') {
                // 音声セレクトボックスに追加
                audioSelect.append(option);
                audioSelect.children('option[value=none]').remove();
            } else if (deviceInfo.kind === 'videoinput') {
                // ビデオセレクトボックスに追加
                videoSelect.append(option);
                videoSelect.children('option[value=none]').remove();
            }
        }
        console.log("1");
    }).then(() => {
        Promise.all([getSessionData]).then(() => {
            setupGetUserMedia();
            console.log("2");
            
        });
        console.log("3");
    }).catch(function (error) {
        console.error('mediaDevices.enumerateDevices() error:', error);
        return;
    });
}).catch(function () {
    Promise.all([getSessionData]).then(() => {
        setupGetUserMedia();
    });

});


function setupGetUserMedia() {
    console.log("setupMedia");
    let audioSource = $('#audioSource').val();
    let videoSource = $('#videoSource').val();
    let constraints = {};

    if (audioSource != "none") {
        Object.assign(constraints, { audio: { deviceId: { exact: audioSource } } });
    }

    if (videoSource != "none") {
        Object.assign(constraints, { video: { deviceId: { exact: videoSource } } });
        constraints.video.width = { min: 240, max: 240 };
        constraints.video.height = { min: 240, max: 240 };
    }

    // 音声かカメラのデバイスがあるとき
    if (Object.keys(constraints).length > 0) {
        console.log("trueeee");
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            console.log(stream.getAudioTracks()[0]);
            segmentedLocalMediaStream.addTrack(stream.getAudioTracks()[0]);
            $('#video_num1').get(0).srcObject = segmentedLocalMediaStream;
            localStream = segmentedLocalMediaStream;
            console.log(localStream.getVideoTracks());
            // ルームに入ってるとき置き換える
            if (existingCall) {
                existingCall.replaceStream(segmentedLocalMediaStream);
            }
            //　ミュート設定
            localStream.getVideoTracks()[0].enabled = videoOn;
            localStream.getAudioTracks()[0].enabled = audioOn;
        }).catch(function (error) {
            console.error('mediaDevice.getUserMedia() error:', error);
            return;
        });
    } else {
        console.log("falseeee");
        // 入力デバイスが無い時
        createMock().then(function (mockStream) {

            localStream = mockStream;
            $('#video_num1').get(0).srcObject = localStream;
            if (room) {
                room.replaceStream(localStream);
            }
        }).catch(function (error) {
            console.error('createMock() error:', error);
            return;
        });
    }
}

function createMock() {
    return new Promise((resolve, reject) => {
        let mockCanvas = document.createElement('canvas');
        let ctx = mockCanvas.getContext('2d');
        let img = new Image();
        img.src = `../images/icon_img/${myIcon}`;
        img.onload = function onImageLoad() {
            ctx.imageSmoothingEnabled = ctx.msImageSmoothingEnabled = SMOOTH;
            ctx.drawImage(img, 0, 0, 16, 10, 0, 0, 320, 200);
            let mockVideo = mockCanvas.captureStream();

            resolve(mockVideo);
        };
        img.onerror = reject;
    });
}

// ビデオストリームのエンコードと送信を開始する関数
function startRecording(stream) {
    console.log(stream);
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
        console.log(event);
        if (event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: 'video/webm' });
        // エンコードされたビデオストリームをSkyWayを介して相手に送信
        existingCall.replaceStream(recordedBlob);
    };
    // レコーダーを開始
    mediaRecorder.start();
    console.log("recorder start");
}

// イベントを設定
function setupCallEventHandlers(call) {
    if (existingCall) {
        existingCall.close();
        console.log("existingCall.close()");
    };

    existingCall = call;
    $('.room_id').text(call.name);

    call.on('stream', function (stream) {
        addVideo(stream);
        remoteStream = stream;
    });

    call.on('removeStream', function (stream) {
        removeVideo(stream.peerId);
    });

    call.on('peerLeave', function (peerId) {
        removeVideo(peerId);
    });

    call.on('close', function () {
        removeAllRemoteVideos();
    });
}


// カメラ映像の枠を追加
function addVideo(stream) {
    createVideoContain("video_num" + ($(".videosContainer video").length + 1), stream, stream.peerId);
    count = $(".videosContainer .swiper-slide").length;
    checkStopCall();
    checkStartCall(count);
    add_slide();
}

// カメラ映像の枠を削除
function removeVideo(peerId) {
    $('#' + peerId).remove();
    count = $(".videosContainer .swiper-slide").length;
    checkStopCall();
    checkStartCall(count);
    // add_slide();
}

// カメラ映像の枠を全て削除
function removeAllRemoteVideos() {
    $('.videosContainer').empty();
    createVideoContain('video_num1', localStream, myPeerID);
    add_slide();

}

// カメラ映像の枠を作る
function createVideoContain(id, value, peerId) {
    const SwiperSlide = $('<div class="swiper-slide"><video autoplay class="videoContainChild"></video></div>');
    const VideoContain = SwiperSlide.children("video");
    VideoContain.attr('id', id);
    VideoContain.get(0).srcObject = value;
    $('.videosContainer').append(SwiperSlide);
    SwiperSlide.attr('id', peerId);
    addContextMenu(SwiperSlide);
    return SwiperSlide;
}
/////////////////////////////////////////