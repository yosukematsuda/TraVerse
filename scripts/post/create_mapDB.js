const fs = require('fs');
//let new_world_id = new Date().getTime().toString(16);
module.exports = function(connection, req, res){
    let map = req.body;
    let sql;
    sql = `INSERT INTO World(WorldID, WorldName) VALUES('${map.new_world_id}', '${map.world_name}');`;
    try{
        connection.query(sql, (error, results) => {
        });
    }catch(err){
        console.error("INSERT:"+err);
    }
    sql = `INSERT INTO Map(MapID, MapName, WorldID, InitialSpawn) VALUES('${map.new_map_id}', '${map.map_name}', '${map.new_world_id}', 1);`;
    try{
        connection.query(sql, (error, results) => {
        });
    }catch(err){
        console.error("INSERT:"+err);
    }
    sql = `INSERT INTO Entrant(WorldID, id, permission) VALUES('${map.new_world_id}', '${map.map_admin}', 3);`;
    try{
        connection.query(sql, (error, results) => {
        });
    }catch(err){
        console.error("INSERT:"+err);
    }

    res.send(`<script>window.location.href="/select";</script>`);

}