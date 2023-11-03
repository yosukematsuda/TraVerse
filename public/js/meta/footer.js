let participant_list_socket_flg = 0;
// 参加者リスト
$("#PeapleButton").on('click', clickPeopleBtn);

// ビデオオンオフ
$("#CameraButton").on('click', clickCameraBtn);

// マイクオンオフ
$("#MicButton").on('click', clickMic);

// 画面共有
$("#CastButton").on('click', shareDisplay);

function clickPeopleBtn(){
    if($("#peopleWindow").length){
        $("#peopleWindow").remove();
        $("#PeapleButton").attr("fill", "white");
        return;
    }
    let call_name_display = "";
    if (call_name != ""){
        call_name_display = `${call_name}の`;
    }
    let peopleWindow = $(`
        <div id="peopleWindow">
            <div id="peopleWindowHeader">
                <div>${call_name_display}参加者</div>
                <img src="images/ui/close.svg" width="10%" id="peopleWindowCloseBtn">
            </div>
            <ul id="peopleWindowList">
            </ul>
        </div>
    `);
    $("footer").before(peopleWindow);
    $("#PeapleButton").attr("fill", "#b8f6ff");
    
    $("#peopleWindowCloseBtn").on("click",function(){
        $("#peopleWindow").remove();
        $("#PeapleButton").attr("fill", "white");
    });

    if (!participant_list_socket_flg){
        // 参加者更新
        socket.on("call-participant-list", function (data) {
            if ($("#peopleWindow").length == 0) return;
            $("#peopleWindowList").empty();
            data.participant.forEach(player => {
                let li = $(`<li>${player.id}:${player.name}:</li>`);
                $("#peopleWindowList").append(li);
            });
        });
        participant_list_socket_flg = 1;
    }

    socket.emit("request-call-participant-list", { MapID: MapID, RoomID: call_name });
}

function clickCameraBtn() {
    if ($('#videoSource').val() == "none") {
        alert("カメラが検出できません");
        return;
    }
    if (!videoOn) {
        videoOn = true;
        changeSVG($(this), SVG_PATH.camera_on, "#b8f6ff", "CameraButton", ["footer_btn"]);
        setupGetUserMedia();
    } else {
        videoOn = false;
        changeSVG($(this), SVG_PATH.camera_off, "#ff8a85", "CameraButton", ["footer_btn"]);
    }
    localStream.getVideoTracks()[0].enabled = videoOn;
    $("#CameraButton").on('click', clickCameraBtn);
}

function clickMic() {
    if ($('#audioSource').val() == "none") {
        alert("マイクが検出できません");
        return;
    }
    if (!audioOn) {
        audioOn = true;
        changeSVG($(this), SVG_PATH.mic_on, "#b8f6ff", "MicButton", ["footer_btn"]);
        setupGetUserMedia();
        speech_flg = 0; // ソケット受信フラグ
    } else {
        audioOn = false;
        changeSVG($(this), SVG_PATH.mic_off, "#ff8a85", "MicButton", ["footer_btn"]);
        speech_flg = -1; // ソケット受信フラグ
    }
    try {
        localStream.getAudioTracks()[0].enabled = audioOn;
    } catch (e) {
    }

    $("#MicButton").on('click', clickMic);
}

