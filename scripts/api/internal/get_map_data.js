const fs = require('fs');

// マップファイル一覧を取得
module.exports = function getAllMapData(req, res) {
    try {
        let WorldID = req.query.world;
        const dir_path = "/home/ec2-user/fd/public/data_map/" + WorldID;
        let result = [];
        let file_list = fs.readdirSync(dir_path);
        file_list.forEach((file) => {
            result.push(file);
        })
        res.json(result);
    } catch (err) {
        res.status(401).send('ReadError');
    }

}
