// ミドルウェアでログイン有無によるページ接近の管理
function is_login(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.redirect('/login');
    }
}

module.exports = {is_login:is_login}