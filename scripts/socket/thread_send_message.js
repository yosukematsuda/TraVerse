const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const DynamoDB = require("/home/ec2-user/fd/scripts/static/dynamodb.js");

module.exports = async function main(ChannelID, UserID, Value){
    return updateItem(ChannelID, UserID, Value);
}

// アイテムの属性値を部分的に更新する
async function updateItem(c_id, u_id, value) {
    let m_id = getUniqueStr();
    const NowTime = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000)).toFormat("YYYY/MM/DD HH24:MI:SS");
    try {
        const command = new UpdateItemCommand({
            TableName: 'thread',
            Key: {
                channel_id: { N: String(c_id) },
            },
            UpdateExpression: "SET #messages.#message = :newMessages",
            ExpressionAttributeNames: {
                "#messages": "messages",
                "#message": String(m_id),
            },
            ExpressionAttributeValues: {
                ":newMessages": {
                    M: {
                        user_id: { S: String(u_id) }, // ユーザーID
                        value: { S: String(value) },    // メッセージの値
                        media: { BOOL: false },
                        reply: { M: {} },       // メッセージのリプライ
                        message_created_at: { S: String(NowTime) },       
                        message_updated_at: { S: String(NowTime) },
                    },
                },
            },
        })
        await DynamoDB.send(command);
        let result = {
            channel_id: c_id,
            message_id: String(m_id),
            user_id: String(u_id),
            value: String(value),
            media: false,
            reply: {},
            message_created_at: String(NowTime),
            message_updated_at: String(NowTime),
            result: true
        }
        return result;
    } catch (err) {
        console.log(err);
        return { result: false };
    }
}

// ID生成
function getUniqueStr(myStrong) {
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
}