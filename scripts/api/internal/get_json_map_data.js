const fs = require('fs');

// Jsonファイルを取得
module.exports = function getJsonMapData(req, res) {
    try {
        let map_json_file = req.query.file_name;
        const dir_path = "/home/ec2-user/fd/public/" + map_json_file;
        let data = JSON.parse(fs.readFileSync(dir_path));
        res.json(data);
    } catch (err) {
        res.status(401).send('ReadError');
    }

}
