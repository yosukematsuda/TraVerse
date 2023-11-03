const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const flash = require('connect-flash');
require('date-utils');

// ファイル階層定義
app.use(express.static(path.join(__dirname, 'public')));
app.use('css', express.static(path.join(__dirname, 'public', 'css')));
app.use('js', express.static(path.join(__dirname, 'public', 'js')));
app.use('data', express.static(path.join(__dirname, 'public', 'data')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//  データベース接続
const connection = require('./scripts/static/db.js');

// ここでlogin関連のapiを管理
app.use('/', require('./scripts/login.js'));
const router = require('./scripts/login.js');

// 自作関数
const Functions = require('./scripts/functions.js');
const SignUp = require('./scripts/post/sign_up.js');
const WorldUp = require('./scripts/post/create_mapDB.js');
const MapUp = require('./scripts/post/add_createDB.js');
const DeleteAccount = require('./scripts/post/delete_account.js');

// SSL証明書のパス
const options = require('./scripts/static/ssl.js');

// サーバー作成
const server = https.createServer(options, app);

// ソケット作成
const socketIO = require('socket.io');
const io = socketIO(server);

// ソケット
const Socket = require('./scripts/socket.js');
Socket.init(io);

// 接続してきたIPを出力する関数
const { printGetIP } = require('./scripts/print_ip.js');
// 喋ったデータをjsonに保存する関数
const { writeJson } = require('./scripts/post/talk.js');



// POSTリクエストの処理
app.post('/post/talk', (req, res) => {
    var data = req.body;
    writeJson(fs, data, req, res);
});
app.post('/post/sign_up', (req, res) => {
    SignUp(connection, req, res);
});
app.post('/post/delete_account', (req, res) => {
    DeleteAccount(connection, req, res);
});
app.post('/post/create_mapDB', (req, res) => {
    WorldUp(connection, req, res);
});
app.post('/post/add_createDB', (req, res) => {
    MapUp(connection, req, res);
});

app.post('/post/get_all_account', (req, res) => {
    let sql = `SELECT * FROM Users;`;
    connection.query(sql, (error, results) => {
        try {
            res.send(results);
        } catch (err) {
            console.error("SELECT:" + err);
        }
    });
});

// API
const InternalAPI = require('./scripts/api/routes');
InternalAPI(app);

// ここからページ定義 -------------------------------------- //
// トップ画面
app.get('/', (req, res) => {
    printGetIP(req, '/');
    res.render('index.ejs');
});

// 新規登録完了ページ
app.get('/sign_up', (req, res) => {
    res.render('sign_up.ejs');
});

//invite
app.get('/invite', (req, res) => {
    res.render('invite.ejs');
});

// マップセレクトページ
router.get('/select', Functions.is_login, function (req, res) {
    try {
        console.log("/select:" + req.user.username);
    } catch (err) {
        console.log(err);
    }
    printGetIP(req, '/select');
    res.render('select.ejs');
})

// 新規マップ作成ページ
router.get('/map_edit', Functions.is_login, function (req, res) {
    try {
        console.log("/map_edit:" + req.user.username);
    } catch (err) {
        console.log(err);
    }
    printGetIP(req, '/map_edit');
    res.render('map_edit.ejs', { file_value: req.query.file });
})


// メインページ
router.get('/meta', Functions.is_login, function (req, res) {
    printGetIP(req, '/meta');
    res.render('meta.ejs');
})

app.get('/invite', (req, res) => {
    printGetIP(req, '/invite');
    res.render('invite.ejs');
});
app.get('/test_meta', (req, res) => {
    printGetIP(req, '/test_meta');
    res.render('test_meta.ejs');
});
app.get('/skyway', (req, res) => {
    res.render('skyway.ejs');
});


// ここまでページ定義 -------------------------------------- //

// HTTPSサーバーの作成と起動
server.listen(443, () => {
    let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    // ./access-logs/YYYY-MM.logに出力
    console.log("+--------------------------------------+");
    console.log("server run | JST " + date.toFormat("YYYY/MM/DD HH24:MI:SS"));
});