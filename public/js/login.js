const LOGIN_ID = document.getElementById("login_id");
const LOGIN_PASSWORD = document.getElementById("login_password");
let timer = 0;
let user_icon_img = [];

// 新規作成page-changeボタン
$(".sign-up-page-change").on("click", function(e){
    e.preventDefault();
    const ShowPage = `sign-up-page${String($(this).data("page"))}`;
    $(".sign-up-page").addClass("hidden");
    $(`#${ShowPage}`).removeClass("hidden");
});

// アイコン一覧取得
$.ajax({
    type: 'get',
    url: '/api/all-user-icon',
    dataType: 'json',  // サーバから取得するデータの型
    success: async function (data, status, xhr) {
        let selected = true;
        // アイコンのキャンバス作成
        for(const img of data){
            let canvas_img = new Image();
            canvas_img.src = `images/icon_img/${img}`;
            const Canvas = document.createElement("canvas");
            Canvas.classList.add("user-icon-canvas");
            Canvas.dataset.selected = selected;
            Canvas.dataset.img = img;
            const Ctx = Canvas.getContext("2d");
            Canvas.width = 64;
            Canvas.height = 70;
            await new Promise(resolve => {
                canvas_img.onload = async function () {
                    // 補間処理
                    Ctx.imageSmoothingEnabled = Ctx.msImageSmoothingEnabled = 0;
                    Ctx.drawImage(
                        canvas_img, 0, 0, 16, 16, 0, 0, 64, 64
                    );
                    document.getElementById("sign-up-select-icon").appendChild(Canvas);
                    user_icon_img.push({ ctx: Ctx, img: canvas_img, selected: selected, id: img });
                    selected = false;
                    resolve();
                }
            });
        }
        $(".user-icon-canvas").on('click', click_user_icon);
        setInterval(function () {
            animation_user_icon();
        }, 25);	
    },
    error: function (xhr, status, err) {
        console.dir(err);
    }
});

function animation_user_icon(){
    timer++;
    user_icon_img.forEach((icon)=>{
        icon.ctx.clearRect(0, 64, 64, 70);
        if(icon.selected === true){
            icon.ctx.clearRect(0, 0, 64, 70);
        // 線描画
            icon.ctx.beginPath();
            icon.ctx.moveTo(0, 68);
            icon.ctx.lineTo(64, 68)
            icon.ctx.strokeStyle = "#5ab4bd";
            icon.ctx.lineWidth = 4;
            icon.ctx.stroke();
        // アイコン表示
            icon.ctx.drawImage(
                icon.img, (timer >> 4 & 1) * 16, 0, 16, 16, 0, 0, 64, 64
            );
        }
    });
}

function click_user_icon(){
    const Selected = $(this).data("selected");
    if(Selected == true) return;
    $(".user-icon-canvas").data("selected", false);
    $(this).data("selected", true);
    const Img = $(this).data("img");
    user_icon_img.forEach((icon, index)=>{
        if(icon.id == Img){
            user_icon_img[index].selected = true;
        }else{
            user_icon_img[index].selected = false;
        }
    });
    $("#sign-up-input-icon").val(Img);
}

// テストアカウント取得
$.ajax({
    type: 'POST',
    url: '/post/get_all_account',
    dataType: 'json',  // サーバから取得するデータの型
    success: function(data, status, xhr) {
        console.dir(data);
        create_account_copy(data);
    },
    error: function(xhr, status, err) {
        console.dir(err);
    }
});

// テストアカウントのボタン作成
function create_account_copy(data){
    data.forEach((d)=>{
        let elm = document.createElement("button");
        elm.setAttribute("id", d.id);
        elm.textContent = d.id;
        elm.addEventListener(("click"),function(e){
            LOGIN_ID.value = e.target.id;
            LOGIN_PASSWORD.value = e.target.id;
            navigator.clipboard.writeText(e.target.id);
        })
        document.getElementById("account").appendChild(elm);
    })
}