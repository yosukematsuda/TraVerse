class WhiteBoard {
    constructor(map_id, room_id, player_id){
        this.current = {
            mode: 1,
            color:"black",
            size:2,
            x:"",
            y:""
        }
        this.status = {
            map_id: map_id,
            room_id: room_id,
            player_id: player_id
        }
        this.drawing = false;
        this.canvas = {
            w: 1000,
            h: 750,
            scale: 1,
            size:0
        }
        this.header = {
            h: 70
        }
        this.img = {
            expansion: "images/ui/expantion_window.svg",
            reduction: "images/ui/reduction_window.svg",
            pen: "images/ui/pen.svg",
            eraser: "images/ui/eraser.svg",
            color_palette: "images/ui/color_palette.svg",
            line_width: "images/ui/line-width.svg",
            reset: "images/ui/reset.svg"
        }
    }
// @Public
    joinRoom(){
        // すでにホワイトボードがあれば再生成
        if ($("#WhiteBoardArea").length) {
            $("#WhiteBoardArea").remove();
        }
        if ($("#WhiteBoardToolsArea").length){
            $("#WhiteBoardToolsArea").remove();
        }
        // ボタンにイベント設定
        $(".wb_area").removeClass("hidden");
        $("#WhiteBoardButton").on("click", this._click_whiteboard_btn);
        // ホワイトボードの要素を作成
        const WhiteBoardCanvasArea = $(`
            <section id="WhiteBoardArea" class="reduction hidden">
            <canvas id="WhiteBoard" width="${this.canvas.w}" height="${this.canvas.h}"></canvas>
            <img src="${this.img.expansion}" id="WhiteBoardSizeEx" class="whiteBoardSizeImg"></img>
            </section>
        `);
        // ツールバーの要素を作成
        const WhiteBoardTools = $(`
            <section id="WhiteBoardToolsArea" class="hidden">
                <div id="WhiteBoardTools">
                    <img src="${this.img.pen}" id="WhiteBoardToolPen" class="whiteBoardTool"></img>
                    <img src="${this.img.eraser}" id="WhiteBoardToolEraser" class="whiteBoardTool"></img>
                    <svg id="WhiteBoardToolPalette" class="whiteBoardTool" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 2C17.5222 2 22 5.97778 22 10.8889C22 13.9556 19.5111 16.4444 16.4444 16.4444H14.4778C13.5556 16.4444 12.8111 17.1889 12.8111 18.1111C12.8111 18.5333 12.9778 18.9222 13.2333 19.2111C13.5 19.5111 13.6667 19.9 13.6667 20.3333C13.6667 21.2556 12.9 22 12 22C6.47778 22 2 17.5222 2 12C2 6.47778 6.47778 2 12 2ZM10.8111 18.1111C10.8111 16.0843 12.451 14.4444 14.4778 14.4444H16.4444C18.4065 14.4444 20 12.851 20 10.8889C20 7.1392 16.4677 4 12 4C7.58235 4 4 7.58235 4 12C4 16.19 7.2226 19.6285 11.324 19.9718C10.9948 19.4168 10.8111 18.7761 10.8111 18.1111ZM7.5 12C6.67157 12 6 11.3284 6 10.5C6 9.67157 6.67157 9 7.5 9C8.32843 9 9 9.67157 9 10.5C9 11.3284 8.32843 12 7.5 12ZM16.5 12C15.6716 12 15 11.3284 15 10.5C15 9.67157 15.6716 9 16.5 9C17.3284 9 18 9.67157 18 10.5C18 11.3284 17.3284 12 16.5 12ZM12 9C11.1716 9 10.5 8.32843 10.5 7.5C10.5 6.67157 11.1716 6 12 6C12.8284 6 13.5 6.67157 13.5 7.5C13.5 8.32843 12.8284 9 12 9Z"></path>
                    </svg>
                    <input type="color" id="WhiteBoardColorPalette">
                    <img src="${this.img.line_width}" id="WhiteBoardToolLineWidth" class="whiteBoardTool"></img>
                    <div id="WhiteBoardLineWidth" class="hidden">
                        <div id="wkSlider2"></div>
                        <div id="wkValue"></div>
                    </div>
                    <img src="${this.img.reset}" id="WhiteBoardReset" class="whiteBoardTool"></img>
                    <img src="${this.img.reduction}" id="WhiteBoardSizeRd" class="whiteBoardSizeImg whiteBoardTool"></img>
                </div>
            </section>
        `);
        // ソケット再設定
        socket.off('whiteboard-drawing', this._onDrawingEvent);
        socket.off('return-whiteboard-get', this._getWhiteBoard);
        socket.off('whiteboard-reset', this._resetWhiteBoard);
        socket.on('whiteboard-drawing', this._onDrawingEvent);
        socket.on('return-whiteboard-get', this._getWhiteBoard);
        socket.on('whiteboard-reset', this._resetWhiteBoard);
        // htmlに挿入
        WhiteBoardCanvasArea.appendTo("#WhiteBoardWrapper");
        WhiteBoardTools.appendTo("#WhiteBoardWrapper");
        // イベントを設定
        $(".whiteBoardSizeImg").on('click', this._click_size);
        $("#WhiteBoardToolPen").on('click', this._click_tool_pen);
        $("#WhiteBoardToolEraser").on('click', this._click_tool_eraser);
        $("#WhiteBoardToolPalette").on('click', this._click_tool_palette);
        $("#WhiteBoardToolLineWidth").on('click', this._click_tool_line_width);
        $("#WhiteBoardReset").on('click', this._click_tool_reset);
        $("#WhiteBoardColorPalette").on('input', this._change_color);
        $("#wkSlider2").slider({
            max: 8, //最大値
            min: 1, //最小値
            value: 2, //初期値
            step: 1, //幅
            create: function (event, ui) {
                $("#wkValue").html("サイズ：" + $(this).slider("value"));
            },
            change: (event, ui) => {
                this.current.size = ui.value;
                $("#wkValue").html("サイズ：" + ui.value);
            }
        });
        // ホワイトボードの履歴を取得
        socket.emit('whiteboard-get', { mapID: this.status.map_id, roomID: this.status.room_id });
    }

    leaveRoom(){
        $(".wb_area").addClass("hidden");
        $("#WhiteBoardButton").off("click");
        $("#WhiteBoardArea").remove();
    }

// @Private
// クリックイベント
    // サイズ変更イベント
    _click_size = () => {
        if(this.canvas.size === 0){ // 拡大
            $("#WhiteBoardArea").removeClass("reduction");
            $("#WhiteBoardArea").addClass("expansion");
            // 拡大縮小画像
            this._windowSizeExpansion();
            // 書き込み有効
            $("#WhiteBoard").on('mousedown', this._onWbMouseDown);
            $("#WhiteBoard").on('mouseup', this._onWbMouseUp);
            $("#WhiteBoard").on('mouseout', this._onWbMouseUp);
            $("#WhiteBoard").on('mousemove', this._WbThrottle(this._onWbMouseMove, 10));
            this.canvas.size = 1;
        }else{ // 縮小
            $("#WhiteBoardArea").removeClass("expansion");
            $("#WhiteBoardArea").addClass("reduction");
            // 拡大縮小画像
            $("#WhiteBoardSizeImg").attr("src", this.img.expansion);
            $("#WhiteBoardArea").css({ 'width': "200px", 'height': "150px" });
            $("#WhiteBoard").css({ 'width': "200px", 'height': "150px" });
            // 書き込み無効
            $("#WhiteBoard").off('mousedown mouseup mouseout mousemove');
            this.canvas.size = 0;
        }
        $("#WhiteBoardSizeEx").toggleClass("hidden");
        $("#WhiteBoardToolsArea").toggleClass("hidden");
    }

    // ペン
    _click_tool_pen = () => {
        this.current.mode = 1;
    }
    // 消しゴム
    _click_tool_eraser = () => {
        this.current.mode = 0;
    }
    // カラーパレット
    _click_tool_palette = () => {
        $("#WhiteBoardColorPalette").trigger("click");
    }
    // 線の太さ
    _click_tool_line_width = () => {
        $("#WhiteBoardLineWidth").toggleClass("hidden");
    }
    // リセット
    _click_tool_reset = () => {
        const Result = window.confirm('ホワイトボードをリセットしますか？');
        if(!Result) return;
        socket.emit('whiteboard-reset', { mapID: this.status.map_id, roomID: this.status.room_id });
    }

    // フッターボタン
    _click_whiteboard_btn = () => {
        $("#WhiteBoardArea").toggleClass("hidden");
        if ($("#WhiteBoardArea").hasClass("hidden")){
            $("#WhiteBoardButton").attr("fill", "white");
        }else{
            $("#WhiteBoardButton").attr("fill", "#b8f6ff");
        }
    }

// カラーパレットイベント
    _change_color = () => {
        this.current.color = $("#WhiteBoardColorPalette").val();
        $("#WhiteBoardToolPalette").css("fill", this.current.color);
    }

// キャンバスイベント
    //　キャンバスに書き込み
    _WbDrawLine = (x0, y0, x1, y1, color, size, player_id, emit) => {
        const canvas = document.getElementById("WhiteBoard");
        const ctx = canvas.getContext("2d");

        // 消しゴム判定
        if(emit && this.current.mode === 0){
            color = "white";
        }

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.stroke();
        ctx.closePath();
        if (!emit) { return; }
        // ソケット受信時は以下を実行しない
        let w = canvas.width;
        let h = canvas.height;

        socket.emit('whiteboard-drawing', {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color,
            size: size,
            player_id: player_id,
            mapID: this.status.map_id,
            roomID: this.status.room_id
        });
    }

    _onWbMouseDown = (e) => {
        this.drawing = true;
        let offset = $("#WhiteBoard").offset();
        this.current.x = this._dictScaleCalc(e.clientX, offset.left);
        this.current.y = this._dictScaleCalc(e.clientY, offset.top);
    }

    _onWbMouseUp = (e) => {
        if (!this.drawing) { return; }
        this.drawing = false;
        let offset = $("#WhiteBoard").offset();
        this._WbDrawLine(
            this.current.x, 
            this.current.y, 
            this._dictScaleCalc(e.clientX, offset.left), 
            this._dictScaleCalc(e.clientY, offset.top), 
            this.current.color, 
            this.current.size,
            this.status.player_id,
            true
        );
    }

    _onWbMouseMove = (e) => {
        if (!this.drawing) { return; }
        let offset = $("#WhiteBoard").offset();
        this._WbDrawLine(
            this.current.x, 
            this.current.y, 
            this._dictScaleCalc(e.clientX, offset.left), 
            this._dictScaleCalc(e.clientY, offset.top), 
            this.current.color, 
            this.current.size,
            this.status.player_id,
            true
        );
        this.current.x = this._dictScaleCalc(e.clientX, offset.left);
        this.current.y = this._dictScaleCalc(e.clientY, offset.top);
    }

    // 時間経過イベント
    _WbThrottle = (callback, delay) => {
        let previousCall = new Date().getTime();
        return function () {
            let time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        }
    }

    // 拡大イベント
    _windowSizeExpansion() {
        let height = window.innerHeight;
        // ヘッダーとフッターとボーダーで引く
        height -= this.header.h * 2 + 10;
        this.canvas.scale = height / this.canvas.h;
        $("#WhiteBoardArea").css({ 'width': this.canvas.w * this.canvas.scale, 'height': height });
        $("#WhiteBoard").css({ 'width': this.canvas.w * this.canvas.scale, 'height': height });
    }

// ソケットイベント
    // 書き込みイベント
    _onDrawingEvent = (data) => {
        if (data.roomID != this.status.room_id) return;
        this._WbDrawLine(
            data.x0 * this.canvas.w, 
            data.y0 * this.canvas.h, 
            data.x1 * this.canvas.w, 
            data.y1 * this.canvas.h, 
            data.color,
            data.size,
            data.player_id,
            false
        );
    }

    // 受け取りイベント
    _getWhiteBoard = (data) => {
        data.forEach((d) => {
            this._WbDrawLine(
                d.x0 * this.canvas.w, 
                d.y0 * this.canvas.h, 
                d.x1 * this.canvas.w, 
                d.y1 * this.canvas.h, 
                d.color,
                d.size,
                d.player_id,
                false
            );
        })
    }

    // リセットイベント
    _resetWhiteBoard = (data) =>{
        if (data.roomID != this.status.room_id) return;
        const canvas = document.getElementById("WhiteBoard");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 座標計算
    _dictScaleCalc(c, o){
        return (c - o) / this.canvas.scale;
    }
}