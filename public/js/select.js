function get_select_data() {
    let map;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/session-data', true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            let sessionData = JSON.parse(xhr.responseText);
            World = sessionData.passport.user.world;
            console.log(sessionData);

        } else {
            console.error('Request failed. Status:', xhr.status);
        }
        let parent_div = document.getElementById("select-box");
        for (let i = 0; i < World.length; i++) {
            let new_element = document.createElement("section");
            let new_div = document.createElement("div");
            let new_content1 = document.createTextNode(World[i].WorldName);
            new_element.appendChild(new_content1);
            new_div.appendChild(new_element);
            new_div.setAttribute("class", "overflow");
            new_element.setAttribute("class", "select-btn");
            new_element.setAttribute("id", World[i].WorldID);
            new_element.setAttribute("value", World[i].WorldID);
            parent_div.insertBefore(new_div, null);
        }
    };
    xhr.send();
}


let All_File;
const getAllFileData = new Promise((resolve) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/all-map-image`, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            All_File = JSON.parse(xhr.responseText);
            console.log(All_File);
            resolve();
        } else {
            console.error('Request failed. Status:', xhr.status);
        }
        let parent_div3 = document.getElementById("map-template-box");
        for (let i = 0; i < All_File.length; i++) {
            let new_element3 = document.createElement("img");
            new_element3.setAttribute('src', 'images/map_img/' + All_File[i]);
            new_element3.setAttribute("class", "images-select-btn");
            let img_name = All_File[i].split('.');
            new_element3.setAttribute("id", img_name[0]);
            new_element3.setAttribute("value", All_File[i]);
            parent_div3.appendChild(new_element3);
        }

    };
    xhr.send();
});

get_select_data();


$("#select-box").on("click", function (e) {
    window.location.href = `https://i-seifu-freedrink.com/meta?value=${e.target.id}`
});

$("#map-template-box").on("click", function (e) {
    if($("#world_name").val() == ""){
        alert("新規ワールド名を入力してください。");
    }else{
        const image_num = e.target.id;
        const world_name = $("#world_name").val();
        window.location.href = `https://i-seifu-freedrink.com/map_edit?value=${image_num}&name=${world_name}&file=create_map`;
    }
});

const showButton = document.getElementById("showDialog");
const favDialog = document.getElementById("favDialog");
const outputBox = document.querySelector("output");
const selectEl = favDialog.querySelector("select");
const confirmBtn = favDialog.querySelector("#confirmBtn");

// "Show the dialog" ボタンで <dialog> をモーダルに開く
showButton.addEventListener("click", () => {
  favDialog.showModal();
});



// ［確認］ボタンが既定でフォームを送信しないようにし、`close()` メソッドでダイアログを閉じ、"close" イベントを発生させる
confirmBtn.addEventListener("click", (event) => {
  event.preventDefault(); // この偽フォームを送信しない
  favDialog.close(selectEl.value); // ここで選択ボックスの値を送る必要がある
});
