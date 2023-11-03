var router = require('express').Router();
const flash = require('connect-flash');
// mysql
const connection = require('./static/db.js')

// loginを管理できるライブラリー
const invitePass = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

router.use(session({ secret: '1234', resave: true, saveUninitialized: false }));
router.use(invitePass.initialize());
router.use(invitePass.session());
router.use(flash());
// ログインページ
router.get('/invite', function (req, res) {
    const params = req.query;

    res.render('invite.ejs', {
        message: req.flash('info')
    });
});

// login
// loginに失敗した場合、/failに飛ばす
router.post('/post_invite',
    invitePass.authenticate('local', { failureRedirect: '/invite?fail=true' }), function (req, res) {
    res.redirect(`/meta?value=${req.body.world}`) ////////////////////////////
});

invitePass.use(new LocalStrategy({
    // inputのnameと合わせる
    usernameField: 'id',
    passwordField: 'password',
    worldField: 'world',
    session: true,
    passReqToCallback: false,
}, function (input_id, input_pw, input_world, done) {
    let sql = `SELECT * FROM Users WHERE id = '${input_id}'`;
    connection.query(sql, function (err, result) {

        // mysql から取り出したUsers情報から１番目の情報と照合する
        login_data = result[0]
        if (err) return done(err)
        if (!login_data) return done(null, false, { message: 'account does not exist' })
        if (input_pw == login_data.password) {
            let WorldArray = [];

            //招待されたワールドの権限を登録
            sql = `INSERT INTO Entrant(WorldID, id, permission) VALUES(${input_world}, ${input_id}, 2)`;
            connection.query(sql, function (err, result) {
                sql = `SELECT World.WorldID, World.WorldName, Entrant.permission, Map.MapID FROM Users, Entrant, World, Map WHERE Users.id = Entrant.id AND World.WorldID = Entrant.WorldID AND World.WorldID = Map.WorldID AND Users.id = '${input_id}' AND Map.InitialSpawn = 1`;
                connection.query(sql, function (err, result) {
                    if(err){
                        console.log('result', result);
                        console.error('err=>',err);
                    };
                    result.forEach((e)=>{
                        WorldArray.push(e);
                    })
                    // 渡すデータ
                    const saveData = {
                        id: login_data.id,
                        username: login_data.username,
                        email: login_data.email,
                        icon: login_data.icon,
                        world: WorldArray
                    };
                    return done(null, saveData)
                });

            });


            // 参加しているマップ取得
        } else {
            return done(null, false, { message: 'wrong password' })
        }
    })
}));

// ログインに成功したらuser.idのセッションを生成し、Cookieを作る
invitePass.serializeUser(function (user, done) {
    const sessionData = {
        id: user.id,
        username: user.username,
        email: user.email,
        world: user.world,
        icon: user.icon
    };
    done(null, sessionData);
});

invitePass.deserializeUser(function (user_id_saved, done) {
    // ユーザーの情報をDBから探す
    const sql = `SELECT * FROM Users WHERE id = '${user_id_saved.id}'`
    connection.query(sql, function (err, result) {
        done(null, result[0])
    })
});

//ログアウト
router.get('/logout', function(req, res, next) {
	req.logout(function(err) {
		if (err) {
			return next(err);
		}
		res.redirect('/login');
	});
});

module.exports = router;
