const fs = require('fs');

module.exports = function(connection, req, res){
    let map = req.body;
    let sql;
    sql = `INSERT INTO Map(MapID, MapName, WorldID, InitialSpawn) VALUES('${map.map_id}', '${map.map_name}', '${map.world_id}', FALSE);`;
    try{
        connection.query(sql, (error, results) => {
        });
    }catch(err){
        console.error("INSERT:"+err);
    }

    res.send(`<script>window.location.href="/meta?value=` + map.world_id + `";</script>`);

}