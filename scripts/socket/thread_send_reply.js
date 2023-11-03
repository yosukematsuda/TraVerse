const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const DynamoDB = require("/home/ec2-user/fd/scripts/static/dynamodb.js");

module.exports = async function main(ChannelID, UserID, Value, MessageID) {
    return updateItem(ChannelID, UserID, Value, MessageID);
}

// アイテムの属性値を部分的に更新する
async function updateItem(c_id, u_id, value, m_id) {
    let r_id = getUniqueStr();
    const NowTime = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000)).toFormat("YYYY/MM/DD HH24:MI:SS");
    try {
        const command = new UpdateItemCommand({
            TableName: 'thread',
            Key: {
                channel_id: { N: String(c_id) },
            },
            UpdateExpression: "SET #messages.#message.#reply.#reply_id = :newMessages",
            ExpressionAttributeNames: {
                "#messages": "messages",
                "#message": String(m_id),
                "#reply": "reply",
                "#reply_id": String(r_id),
            },
            ExpressionAttributeValues: {
                ":newMessages": {
                    M: {
                        user_id: { S: String(u_id) }, // ユーザーID
                        value: { S: String(value) },    // メッセージの値
                        media: { BOOL: false },
                        reply_created_at: { S: String(NowTime) },
                        reply_updated_at: { S: String(NowTime) },
                    },
                },
            },
        })
        await DynamoDB.send(command);
        let result = {
            channel_id: c_id,
            message_id: String(m_id),
            reply_id: String(r_id),
            user_id: String(u_id),
            value: String(value),
            media: false,
            reply_created_at: String(NowTime),
            reply_updated_at: String(NowTime),
            result: true
        }
        return result;
    } catch (err) {
        console.log(err);
        return {result: false};
    }
}

// ID生成
function getUniqueStr(myStrong) {
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
}