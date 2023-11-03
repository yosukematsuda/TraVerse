function addContextMenu(elm){
    // 右クリックイベント
    elm.on('contextmenu', (e) => {
        $("#ContextMenu").remove();
        // 右クリックメニュー作成
        createContextMenu(e.clientY, e.clientX, e.currentTarget.id);
        // 右クリックメニュー表示後のイベント
        $(document).on('click.one',function(e) {
            // 右クリックメニュー以外をクリックしたら要素を消してイベントを戻す
            if(!$(e.target).closest('#ContextMenu').length) {
                $(document).off("click.one");
                $("#ContextMenu").remove();
            }
        });
        return false;
    });
}

// 右クリックメニュー作成
function createContextMenu(posY, posX, id){
    const Elm = $("<label id='ContextMenu' ><input type='range' step='1' min='0' max='100' id='volumeSlider'>音量</label>");
    $(".videosContainer").append(Elm);
    $("#ContextMenu").offset({ top: posY, left: posX });
    $("#ContextMenu").css('z-index','600');
    $("#volumeSlider").data("id", id);

    // スライダーイベント
    $("#volumeSlider").on('input',()=>{
        let id = $("#volumeSlider").data('id');
        let val = $("#volumeSlider").val();
        // 対象のvideoタグの音量を設定
        const TargetDom = document.querySelectorAll(`#${id} video`);
        TargetDom.volume = val;
    });
}
