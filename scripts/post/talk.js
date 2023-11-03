function writeJson(fs, data, req, res){
    var roomID = data.roomID;
    var spaceID = data.spaceID;
    var talkData = { [data.id] : data.value };
    talkData = JSON.stringify(talkData);
    var path = `./public/data/meeting/${spaceID}/${roomID}`;

    if (!fs.existsSync(`./public/data/meeting/${spaceID}`)) {
        fs.mkdirSync(`./public/data/meeting/${spaceID}`);
    }
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    fs.appendFile(`${path}/sentence.json`, ',' + talkData, 'utf8',(err) => {
        if(err){
            res.status(500).json({ message: 'sentence.jsonに追記失敗' });
            return;
        }else{
            //res.json({ message: 'sentence.jsonに追記' });
        }
    });
    fs.writeFile(`${path}/word.json`, talkData, 'utf8',(err) => {
        if(err) {
            res.status(500).json({ message: 'word.json書き換え失敗' });
            return;
        }else{
            //res.json({ message: 'word.json書き換え' });
        }
    });
    res.json({ message: '成功' });
    return;
}

module.exports = { writeJson }