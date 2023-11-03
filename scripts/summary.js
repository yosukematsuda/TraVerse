const GptAPI = require('./api/openai.js');
const DEEPL_API_KEY = 'your API key';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const fetch = require("node-fetch");
const fs = require('fs');
const DIR_PATH = "/home/ec2-user/fd/public/data_summary/";

async function main(talk, file_path, room_path) {
    let talk_array = talk.data;
    let send_data = "";
    // 文字を繋げる
    await talk_array.forEach(talk => {
        send_data = send_data + talk.value + "。";
    });
    // 英語に変換
    let resultEN = await deeplAPI(send_data, 0);
    // 要約
    let resultSummary = await GptAPI.Summary(resultEN);
    // 日本語に変換
    let resultJA = await deeplAPI(resultSummary.content, 1);
    // 保存
    summarySave(resultJA, file_path, room_path);
}

// 翻訳する ja:1 en:0
async function deeplAPI(send_data, lang) {
    let res;
    let set_lang = (lang === 0) ? "&source_lang=JA&target_lang=EN" : "&source_lang=EN&target_lang=JA";

    let content = encodeURI('auth_key=' + DEEPL_API_KEY + '&text=' + send_data + set_lang);
    let url = DEEPL_API_URL + '?' + content;
    await fetch(url).then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Could not reach the API: " + response.statusText);
        }
    }).then(function (data) {
        res = data.translations[0].text;
    }).catch(function (error) {
        console.error(error);
    });
    return res;
}

// 保存する
function summarySave(text, file_path, room_path) {
    let dir_path = `${DIR_PATH}/${room_path}`;
    file_path = file_path.replace('.json', '.txt');
    let path = `${DIR_PATH}/${room_path}/${file_path}`;
    try {
        // ディレクトリが存在しない時
        if (!fs.existsSync(dir_path)) {
            fs.mkdirSync(dir_path, (err) => {
                if (err) throw err;
            });
        }
        fs.writeFileSync(path, text, (err) => {
            if (err) throw err;
        });
    } catch (err) {
        console.error(err);
    }
}

module.exports = { main };