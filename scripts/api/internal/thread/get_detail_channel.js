const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const DynamoDB = require("/home/ec2-user/fd/scripts/static/dynamodb.js");

module.exports = async function main(req, res) {
    try {
        const ChannelID = req.query.channel;
        // DynamoDBからチャンネルを取得
        let dynamoDB_result = await getExecute(ChannelID);
        // レスポンス
        res.json(dynamoDB_result);
    } catch (err) {
        console.log(err);
        res.status(401).send(err);
    }
    // DynamoDBから取得
    async function getExecute(id) {
        try {
            const command = new GetItemCommand({
                TableName: 'thread',
                Key: {
                    channel_id: { N: String(id) },
                }
            });
            const Result = await DynamoDB.send(command);
            return Result;
        } catch (e) {
            console.log(e);
            return e;
        }
    }
}

