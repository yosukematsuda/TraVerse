const RDS = require('/home/ec2-user/fd/scripts/static/db.js');
module.exports = async function main(req, res) {
    try {
        const WorldID = req.query.world;
    // RDSからチャンネル一覧を取得
        let sql = `SELECT ChannelID, ChannelName FROM Thread WHERE WorldID='${WorldID}';`;
        RDS.query(sql, async (error, results) => {
            if (error) throw new Error('(R)チャンネル一覧の取得に失敗');
            let result = {thread:[]}
            // チャンネルがない時はここで返す
            if (results.length === 0){
                res.json(result); 
                return;
            } 
            results.forEach((row)=>{
                result.thread.push({ ChannelID: row['ChannelID'], ChannelName: row['ChannelName']});
            });
            res.json(result);
        });
    } catch (err) {
        console.log(err);
        res.status(401).send(err);
    }
}
