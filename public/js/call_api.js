let All_Sumarry;
function call_api(WorldID, MapID){
    // 要約一覧取得
    
    const getAllSummaryData = new Promise((resolve) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/api/all-summary-data?world=${WorldID}&map=${MapID}`, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                All_Sumarry = JSON.parse(xhr.responseText);
                console.log("All_Sumarry");
                console.log(All_Sumarry);
                resolve();
            } else {
                console.error('Request failed. Status:', xhr.status);
            }
        };
        xhr.send();
    });

    // 会話履歴取得
    const getAllTalkData = new Promise((resolve) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/api/all-talk-data?world=${WorldID}&map=${MapID}`, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                data = JSON.parse(xhr.responseText);
                console.log(data);
                Promise.all([getAllSummaryData]).then(() => {
                    talk_list_render(data);
                });
                resolve();
            } else {
                console.error('Request failed. Status:', xhr.status);
            }
        };
        xhr.send();
    });

    // チャンネル一覧を取得
    getChannel(WorldID);
}
