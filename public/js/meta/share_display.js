async function startCapture(displayMediaOptions) {
    let captureStream;

    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(
            displayMediaOptions
        );
    } catch (err) {
        console.error(`Error: ${err}`);
    }
    return captureStream;
}


async function shareDisplay(){
    try {
        console.log(localStream.getAudioTracks());
        var streaming = await startCapture({ video: true });
        if (localStream.getAudioTracks()[0]) {
            streaming.addTrack(localStream.getAudioTracks()[0]);
        }
        $("#video_num1").get(0).srcObject = streaming;
        room.replaceStream(streaming);

        let [displayVideoTrack] = streaming.getVideoTracks();
        displayVideoTrack.addEventListener('ended', () => {
            streaming.getVideoTracks()[0].stop();
            room.replaceStream(localStream);
            $("#video_num1").get(0).srcObject = localStream;
        }, { once: true });

    } catch (err) {
        console.error(`Error: ${err}`);
    }
}
