const RDS = require('/home/ec2-user/fd/scripts/static/db.js');
module.exports = async function main(req, res) {
    try {
        const WorldID = req.query.WorldID;
    // RDSからチャンネル一覧を取得
        let sql = `SELECT MapID FROM Map WHERE WorldID='${WorldID}';`;
        RDS.query(sql, async (error, results) => {
            if (error) throw new Error('(R)Map一覧の取得に失敗');
            let result = [];
            if (results.length === 0){
                res.json(result);
                return;
            }
            results.forEach((row)=>{
                result.push(row.MapID);
            });
            res.json(result);
        });
    } catch (err) {
        console.log(err);
        res.status(401).send(err);
    }
}
