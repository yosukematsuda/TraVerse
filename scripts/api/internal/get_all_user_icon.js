const DIR_PATH = "/home/ec2-user/fd/public/images/icon_img";
const fs = require('fs');

// マップの会話一覧を取得
module.exports = function getAllUserIcon(req, res) {
    try {
        let result = [];
        let file_list = fs.readdirSync(DIR_PATH);
        file_list.forEach((file) => {
            result.push(file);
        })
        res.json(result);
    } catch (err) {
        console.error(err);
    }
}

