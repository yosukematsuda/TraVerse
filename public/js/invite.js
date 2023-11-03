const LOGIN_ID = document.getElementById("login_id");
const LOGIN_PASSWORD = document.getElementById("login_password");

const urlParams = new URLSearchParams(window.location.search);
const WORLD_ID = urlParams.get('world');
document.getElementById('world').value= WORLD_ID;



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

