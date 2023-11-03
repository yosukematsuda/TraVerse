const DIR_PATH = "/home/ec2-user/fd/public/data_chat";
const fs = require('fs');

// 会話内容を取得
module.exports = function getTalk(req, res) {
    if (req.isAuthenticated()) {
        let worldID = req.query.world;
        let mapID = req.query.map;
        let roomID = req.query.room;
        let date = req.query.date;
        let path = `${DIR_PATH}/${worldID}/${mapID}/${roomID}/${date}`;
        try {
            let data = fs.readFileSync(path, 'utf8');
            res.json(data);
        } catch (err) {
            res.status(401).send('ReadError');
        }
    } else {
        res.status(401).send('Unauthorized'); // 認証されていない場合はエラーレスポンスを返す
    }
}
