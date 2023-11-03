module.exports = function getSession(req, res) {
  if (req.isAuthenticated()) {
    var sessionData = req.session; // セッションデータを取得
    res.json(sessionData); // セッションデータをJSON形式でレスポンスとして返す
  } else {
    res.status(401).send('Unauthorized'); // 認証されていない場合はエラーレスポンスを返す
  }
}
