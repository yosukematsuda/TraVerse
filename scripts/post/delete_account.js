module.exports = function(connection, req, res){
    let formData = req.body;
    let sql = `SELECT * FROM Users WHERE id = '${formData.id}' AND password = '${formData.password}';`;
    connection.query(sql, (error, results) => {
        try{
            if(results.length > 0){
                // アカウント名が存在する場合
                let account_name = results[0].username;
                sql = `DELETE FROM Users WHERE id = '${formData.id}';`;
                try{
                    connection.query(sql, (error, results) => {
                        req.flash('info', `${account_name}を削除しました。`);
                        res.redirect('/login');
                    });
                }catch(err){
                    console.error("DELETE:"+err);
                    req.flash('info', `${account_name}の削除に失敗しました。`);
                    res.redirect('/login');
                }
            }else{
                // アカウント名がすでに存在する時
                console.log("INSERT else:" + results);
                req.flash('info', `アカウントが存在しません。`);
                res.redirect('/login');
            }
        }catch(err){
            console.error("SELECT:"+err);
            req.flash('info', `削除に失敗しました。`);
            res.redirect('/login');
        }
    });
}