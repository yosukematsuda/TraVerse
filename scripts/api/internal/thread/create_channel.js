const { PutItemCommand } = require("@aws-sdk/client-dynamodb");
const DynamoDB = require("/home/ec2-user/fd/scripts/static/dynamodb.js");
const RDS = require('/home/ec2-user/fd/scripts/static/db.js');
module.exports = async function main(req, res){
    try {
        const WorldID = req.query.world;
        const ChannelName = decodeURI(req.query.channel_name);
        let ChannelID;
    // RDSにチャンネルを追加
        // チャンネルを追加
        let sql = `INSERT INTO Thread(ChannelName, WorldID) VALUES('${ChannelName}', '${WorldID}');`;
        RDS.query(sql, async (error, results) => {
            if(error) throw new Error('(R)チャンネルの作成に失敗');
        // チャンネルIDを取得
            sql = `SELECT LAST_INSERT_ID();`;
            RDS.query(sql, async (error, results) => {
                if (error) throw new Error('(R)チャンネルIDの取得に失敗');
                ChannelID = results[0]['LAST_INSERT_ID()'];
                console.log(ChannelID);
            // DynamoDBにチャンネルを追加
                let dynamoDB_result = await putExecute(ChannelID, ChannelName);
                if (dynamoDB_result !== true) throw new Error('(D)チャンネルの作成に失敗');
            // レスポンス
                let result = { WorldID: WorldID, ChannelID: ChannelID, ChannelName: ChannelName }
                res.json(result);
            });
        });
    } catch (err) {
        console.log(err);
        res.status(401).send(err);
    }
    
}

// DynamoDBに追加
async function putExecute(id, name) {
    const NowTime = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000)).toFormat("YYYY/MM/DD HH24:MI:SS");
    try {
        const command = new PutItemCommand({
            TableName: 'thread',
            Item: {
                channel_id: { N: String(id) },
                channel_name: { S: name },
                messages: { M: {} },
                participants: { L: [] },
                channel_created_at: { S: String(NowTime) },
                channel_updated_at: { S: String(NowTime) }
            },
        });
        await DynamoDB.send(command);
        return true;
    } catch (e) {
        console.log(e);
        return e;
    }
}