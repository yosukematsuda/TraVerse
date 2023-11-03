const axios = require('axios');
const fs = require('fs');
require('date-utils');

// IPアドレスから地域情報を取得する関数
async function getRegionFromIP(ip) {
    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        const { city, region, country_name } = response.data;
        return `${city}, ${region}, ${country_name}`;
    } catch (error) {
        //console.error('地域情報の取得に失敗しました:', error);
        return 'Unknown';
    }
}

// 接続してきた情報を取得
async function printGetIP(req, page) {
    let ip = '0.0.0.0';

    // ip取得
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(',')[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else if (req.connection.socket && req.connection.socket.remoteAddress) {
        ip = req.connection.socket.remoteAddress;
    } else if (req.socket && req.socket.remoteAddress) {
        ip = req.socket.remoteAddress;
    }

    // IPv6->IPv4
    if (ip.startsWith('::ffff:')) {
        ip = ip.slice('::ffff:'.length);
    }

    let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    let region = await getRegionFromIP(ip);
    let month = ("0"+(date.getMonth() + 1)).slice(-2);
    let logPath = `./access-logs/${date.getFullYear()}-${month}.log`;
    // ./access-logs/YYYY-MM.logに出力
    if (!fs.existsSync(logPath)) {
        fs.writeFile(logPath, "newFile", (err) => {
            if (err) throw err;
        });
    }
    fs.appendFileSync(logPath, `${page} | JST ${date.toFormat("YYYY/MM/DD HH24:MI:SS")} | IP: ${ip} | Region: ${region}\n`);
    //console.log(`${page} | JST ${date.toFormat("YYYY/MM/DD HH24:MI:SS")} | IP: ${ip} | Region: ${region}`);
}

module.exports = { printGetIP };