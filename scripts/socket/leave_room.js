const fs = require('fs');
const Summary = require('./summary.js');

async function main(WorldID, MapID, RoomID, Chat) {
    let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let min = ("0" + (date.getMinutes())).slice(-2);
    let dir_path = `/home/ec2-user/fd/public/data_chat/${WorldID}/${MapID}/${RoomID}`;
    let file_path = `${date.getFullYear()}-${month}-${date.getDate()}-${date.getHours()}-${min}-${date.getSeconds()}.json`;
    let path = `${dir_path}/${file_path}`;
    let room_path = `${MapID}/${RoomID}`;
    try {
        // ディレクトリが存在しない時
        if (!fs.existsSync(dir_path)) {
            fs.mkdirSync(dir_path, (err) => {
                if (err) throw err;
            });
        }
        // ファイルが存在しないとき
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, "", (err) => {
                if (err) throw err;
            });
        }
        let writeData = { data: Chat }
        // 保存
        try {
            fs.appendFileSync(path, JSON.stringify(writeData));
        } catch (err) {
            console.error(err);
        }
        // 要約
        if (saveMode === 2) {
            Summary.main(writeData, file_path, room_path);
        }
    } catch (err) {
        console.error(err);
    }
    return;
}


module.exports = { main };