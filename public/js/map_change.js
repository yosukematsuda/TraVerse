function map_change(file_name, spawn_place){
    let angle_judge;
    Map_Data = maps.find(map => map.name === file_name).data;
    let spawn_idx = Map_Data.data.map(e => e.move.num).indexOf(spawn_place)
    angle_judge = Map_Data.data[spawn_idx].texture;
    player_x = (spawn_idx % 32) * 16 + 8;
    player_y = Math.floor(spawn_idx / 32) * 16 + 8;
    MAP_FILE = "images/map_img/" + file_name.split('-')[0] + ".png";
    ///画像ごとの出現場所と向きを設定
    if(file_name.split('-')[0] === '01' && angle_judge === 25){
        player_angle = 1;
        player_x += 16;
    }
    map_img = new Image();
    map_img.src = MAP_FILE;		//	マップ画像読み込み
    add_slide();
    virtual_screen = document.createElement("canvas");	//	仮想画面を作成
    virtual_screen.width = WIDTH;							//	仮想画面の幅を設定
    virtual_screen.height = HEIGHT;						//	仮想画面の高さを設定
    name_screen = document.createElement("canvas");
    re_size();
    socket.emit('change-map', {
        player_x: player_x,
        player_y: player_y,
        player_angle: player_angle,
        MapID: file_name
    });
}