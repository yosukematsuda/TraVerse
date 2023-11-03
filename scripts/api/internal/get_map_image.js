const DIR_PATH = "/home/ec2-user/fd/public/images/map_img";
const fs = require('fs');

// マップ画像一覧を取得
module.exports = function getAllMapImage(req, res) {
    try {
        let result = [];
        let file_list = fs.readdirSync(DIR_PATH);
        file_list.forEach((file) => {
            result.push(file);
        })
        res.json(result);
    } catch (err) {
        res.status(401).send('ReadError');
    }
    
}
