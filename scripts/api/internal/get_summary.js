const DIR_PATH = "/home/ec2-user/fd/public/data_summary";
const fs = require('fs');

module.exports = function getSummary(req, res) {
  if (req.isAuthenticated()) {
    let worldID = req.query.world;
    let mapID = req.query.map;
    let roomID = req.query.room;
    let date = req.query.date;
    let path = `${DIR_PATH}/${worldID}/${mapID}/${roomID}/${date}`;
    try {
      let text = fs.readFileSync(path, 'utf-8');
      res.json(text);
    } catch (err) {
      res.status(401).send('FileError');
    }
  } else {
    res.status(401).send('Unauthorized'); // 認証されていない場合はエラーレスポンスを返す
  }
}
