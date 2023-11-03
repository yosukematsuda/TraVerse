const canvasElement = document.createElement('canvas');
const canvasCtx = canvasElement.getContext("2d");
const canvasElement2 = document.createElement('canvas');
const canvasCtx2 = canvasElement2.getContext("2d");

var segmentedLocalMediaStream;
function onResults(results) {
    // 人物切り抜き
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.segmentationMask,
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );
    canvasCtx.globalCompositeOperation = "source-in";
    canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    // 背景ぼかし
    canvasCtx2.save();
    canvasCtx2.clearRect(0, 0, canvasElement2.width, canvasElement2.height);


    // canvasCtx2.drawImage(
    //     results.segmentationMask,
    //     0,
    //     0,
    //     canvasElement2.width,
    //     canvasElement2.height
    // );
    // canvasCtx2.globalCompositeOperation = "source-out";
    canvasCtx2.drawImage(
        results.image,
        0,
        0,
        canvasElement2.width,
        canvasElement2.height
    );
    canvasCtx2.filter = "blur(5px)";

    // 描画する画像は重なっていない部分のみ描画する
    canvasCtx.globalCompositeOperation = "destination-over";
    canvasCtx.drawImage(canvasCtx2.canvas, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.restore();
    results.segmentationMask.close();
    results.image.close();
}

const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    },
});
selfieSegmentation.setOptions({
    modelSelection: 1,
});
selfieSegmentation.onResults(onResults);
(async function () {
    const localMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: 1080,
            height: 720,
            frameRate: 15,
        },
        audio: true,
    });
    const processor = new MediaStreamTrackProcessor(
        localMediaStream.getVideoTracks()[0]
    );
    const writable = new WritableStream({
        start() {
            console.log("WritableStream started");
        },
        async write(videoFrame) {
            const imageBitmap = await createImageBitmap(videoFrame);
            await selfieSegmentation.send({ image: imageBitmap });
            imageBitmap.close();
            videoFrame.close();
        },
        stop() {
            console.log("WritableStream stopped");
        },
    });
    processor.readable.pipeTo(writable);

    // ストリームの取得
    segmentedLocalMediaStream = canvasElement.captureStream();
})();