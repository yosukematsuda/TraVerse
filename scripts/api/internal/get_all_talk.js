const DIR_PATH = "/home/ec2-user/fd/public/data_chat";
const fs = require('fs');

// マップの会話一覧を取得
module.exports = function getAllTalk(req, res) {
    if (req.isAuthenticated()) {
        let worldID = req.query.world;
        let mapID = req.query.map;
        const PATH = `${DIR_PATH}/${worldID}/${mapID}`;
        let result = {};
        try {
            let dir_list = fs.readdirSync(PATH);
            // ルームごとに回す
            dir_list.forEach((dir)=>{
                // ルームの会話一覧を取得
                let file_list = fs.readdirSync(`${PATH}/${dir}`);
                result[dir] = file_list;
            })
        } catch (err) {
        }
        res.json(result);
    } else {
        res.status(401).send('Unauthorized'); // 認証されていない場合はエラーレスポンスを返す
    }
}
