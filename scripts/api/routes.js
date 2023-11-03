const getSession = require('./internal/get_session');
const getSummary = require('./internal/get_summary');
const getAllSummary = require('./internal/get_all_summary');
const getTalk = require('./internal/get_talk');
const getAllTalk = require('./internal/get_all_talk');
const getAllMapImage = require('./internal/get_map_image');
const getAllMapData = require('./internal/get_map_data');
const getJsonMapData = require('./internal/get_json_map_data');
const createChannel = require('./internal/thread/create_channel');
const getChannel = require('./internal/thread/get_channel');
const getDetailChannel = require('./internal/thread/get_detail_channel');
const getAllUserIcon = require('./internal/get_all_user_icon');
const getAllMapDB = require('./internal/get_all_map_DB');



module.exports = function InternalAPI(app) {
// セッションを取得
    app.get('/api/session-data', function (req, res) {
        getSession(req, res);
    });
// ユーザーアイコン一覧を取得
    app.get('/api/all-user-icon', function (req, res) {
        getAllUserIcon(req, res);
    });
// ----------------------------------------------------- 会話要約
// 要約を取得
    app.get('/api/summary-data', function (req, res) {
        getSummary(req, res);
    });
// 要約一覧を取得
    app.get('/api/all-summary-data', function (req, res) {
        getAllSummary(req, res);
    });
// 会話を取得
    app.get('/api/talk-data', function (req, res) {
        getTalk(req, res);
    });
// 会話一覧を取得
    app.get('/api/all-talk-data', function (req, res) {
        getAllTalk(req, res);
    });
// ----------------------------------------------------- マップ
// マップ画像一覧を取得
    app.get('/api/all-map-image', function (req, res) {
        getAllMapImage(req, res);
    });
// マップファイル一覧を取得
    app.get('/api/all-map-data', function (req, res) {
        getAllMapData(req, res);
    });
// DBからマップIDをワールドID検索
app.get('/api/get-all-map-DB', function (req, res) {
    getAllMapDB(req, res);
});
// マップファイルを取得
    app.get('/api/json-map-data', function (req, res) {
        getJsonMapData(req, res);
    });
// ----------------------------------------------------- スレッド
// スレッドチャンネルを作成
    app.get('/api/create-channel', function (req, res) {
        createChannel(req, res);
    });
// スレッドチャンネルを作成
    app.get('/api/get-channel', function (req, res) {
        getChannel(req, res);
    });
// チャンネル詳細を取得
    app.get('/api/get-detail-channel', function (req, res) {
        getDetailChannel(req, res);
    });
}
