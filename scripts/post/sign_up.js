module.exports = function(connection, req, res){
    const PassCheck = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])/;
    let formData = req.body;
    console.log("sign_up_form:"+JSON.stringify(formData));
    // アカウント名に@を含む時とパスワードが適切でない場合弾く
    if(formData.id.indexOf("@") !== -1){
        res.send(`<script>alert("@は使えません。"); window.location.href="/login";</script>`);
        return;
    }else if(!PassCheck.test(formData.password)){
        res.send(`<script>alert("パスワードに大文字、小文字、数字を含めてください。"); window.location.href="/login";</script>`);
        return;
    }

    let sql = `SELECT * FROM Users WHERE id = '${formData.id}';`;
    connection.query(sql, (error, results) => {
        try{
            if(results.length === 0){
                // アカウント名が存在しない時
                sql = `INSERT INTO Users(id, username, password, email, icon) VALUES('${formData.id}', '${formData.username}', '${formData.password}', '${formData.email}', '${formData.icon}')`;
                try{
                    connection.query(sql, (error, results) => {
                        console.log("INSERT try:" + results);
                        req.flash('info', `${formData.id}を登録しました。`);
                        res.redirect('/login');
                    });
                }catch(err){
                    console.error("INSERT:"+err);
                }
            }else{
                // アカウント名がすでに存在する時
                console.log("INSERT else:" + results);
                req.flash('info', `すでにアカウント名が使われています。`);
                res.redirect('/login');
            }
        }catch(err){
            console.error("SELECT:"+err);
        }
    });
}