"use strict";

const socket = io();
console.log(socket);
const urlParams = new URLSearchParams(window.location.search);
const World_ID = urlParams.get('value');
document.getElementById('invite-url').value = `https://i-seifu-freedrink.com/invite?world=${World_ID}`;
let player_file;
let room, sessionData, myID, myName, myIcon, peer, worldArray, permission;
let meta_map_id, select_value;
let map_json_file;
let MAP_FILE;
let Map_Files;
let maps = [];
let xhr;
const get_session_data = Promise.resolve()
	.then(function(){
		return new Promise (function(resolve){
			xhr = new XMLHttpRequest();
			xhr.open('GET', '/api/session-data', true);
			xhr.onload = function () {
				if (xhr.status === 200) {
					sessionData = JSON.parse(xhr.responseText);
					myID = sessionData.passport.user.id;
					myName = sessionData.passport.user.username;
					myIcon = sessionData.passport.user.icon;
					worldArray = sessionData.passport.user.world;
					worldArray.forEach((world) => {
						if(world.WorldID == World_ID){
							meta_map_id = world.MapID;
							MAP_FILE= "images/map_img/" + meta_map_id.split('-')[0] + ".png"
							map_json_file = 'data_map/' + World_ID + '/' + meta_map_id + '.json';
							select_value = meta_map_id;
							permission = world.permission;
						}
					});
					player_file = "images/icon_img/" + myIcon;
					resolve();
				} else {
					console.error('Request failed. Status:', xhr.status);
					resolve();
				}
			};
			xhr.send();
		});
	}).then(function(){
		return new Promise (function(resolve){
			xhr = new XMLHttpRequest();
			xhr.open('GET', `/api/get-all-map-DB?WorldID=` + World_ID, true);
			xhr.onload = function () {
				if (xhr.status === 200) {
					Map_Files = JSON.parse(xhr.responseText);
					resolve();
				}else{
					console.error('Request failed. Status:', xhr.status);
					resolve();
				}
			}
			xhr.send();
		});
	}).then(function(){
		return new Promise (async function(resolve){
			if(Map_Files != null){
				await get_all_map_data(Map_Files);

				resolve();
			}else{
				resolve();
			}
		});
	}).then(function(){
		return new Promise (function(resolve){
			Map_Data = maps.find(map => map.name === meta_map_id).data;
			resolve();
		});
	});

const CHR_HEIGHT = 16;					//	キャラの高さ
const CHR_WIDTH = 16;					//	キャラの幅
const FONT = "12px monospace";		//	使用フォント
const FONTSTYLE = "#ffffff";			//	文字色
const HEIGHT = 128;					//	仮想画面サイズ。高さ
const WIDTH = 256;					//	仮想画面サイズ。幅
const MAP_HEIGHT = 32;					//	マップ高さ
const MAP_WIDTH = 32;					//	マップ幅
const SCR_HEIGHT = 8;					//	画面タイルサイズの高さ
const SCR_WIDTH = 16;					//	画面タイルサイズの幅
const SMOOTH = 0;					//	補間処理
const TILE_COLUMN = 6;					//	タイル桁数
const TILE_ROW = 7;					//	タイル行数
const TILE_SIZE = 16;					//	タイルサイズ(ドット）
const gKey = new Uint8Array(0x100);		//	キー入力バッファ

let START_X;					//	開始位置X
let START_Y;					//	開始位置Y

let first_call = 0;
let init_call = 0;
let player_angle = 0;							//	プレイヤーの向き
let frame_count = 0;							//	内部カウンタ
let window_height;							//	実画面の高さ
let window_width;								//	実画面の幅
let move_x = 0;							//	移動量X
let move_y = 0;							//	移動量Y
let other_move_x = 0;
let other_move_y = 0;

let map;
let map_img;							//	画像。マップ
let player_img;							//	画像。プレイヤー
let player_x;	//	プレイヤー座標X
let player_y;	//	プレイヤー座標Y
let other_x;
let other_y;
let other_angle;
let other_move_judge;
let other_icon;
let other_name;
let monitor_idx;
let virtual_screen;							//	仮想画面
let name_screen;
let other_users = [];
let other_icon_file;
let m = -1; //Map_data.data.texture
let c; //Map_data.data.call
let move_name; //Map_data.data.move.name
let move_num; //Map_data.data.move.num
let call_name = "";

let change;

let Map_Data;



async function get_all_map_data(Files){
	for(const File_Name of Files){
		const PATH = 'data_map/' + World_ID + '/' + File_Name + '.json';
		let map_data;
		await new Promise((resolve) => {
			xhr = new XMLHttpRequest();
			xhr.open('GET', `/api/json-map-data?file_name=${PATH}`, true);
			xhr.onload = function () {
				if (xhr.status === 200) {
					map_data = JSON.parse(xhr.responseText);
					maps.push({ name: File_Name, data: map_data });
					resolve();
				}else{
					console.error('Request failed. Status:', xhr.status);
					resolve();
				};
			};
			xhr.send();
		})
	};
};



function main() {
	const screen_2D = virtual_screen.getContext("2d");				//	仮想画面の2D描画コンテキストを取得
	screen_2D.clearRect(0, 0, virtual_screen.width, virtual_screen.height);


	let mx = Math.floor(player_x / TILE_SIZE);			//	プレイヤーのタイル座標X
	let my = Math.floor(player_y / TILE_SIZE);			//	プレイヤーのタイル座標Y

	for (let dy = -SCR_HEIGHT; dy <= SCR_HEIGHT; dy++) {
		let ty = my + dy;								//	タイル座標Y（マップの座標Y）
		let py = (ty + MAP_HEIGHT) % MAP_HEIGHT;		//	ループ後タイル座標Y
		for (let dx = -SCR_WIDTH; dx <= SCR_WIDTH; dx++) {
			let tx = mx + dx;							//	タイル座標X（マップの座標X）
			let px = (tx + MAP_WIDTH) % MAP_WIDTH;	//	ループ後タイル座標X
			if((ty > MAP_HEIGHT - 1 || ty < 0)||(tx > MAP_WIDTH - 1 || tx < 0)){
				over_tile_data(
					screen_2D,
					tx * TILE_SIZE + WIDTH / 2 - player_x,
					ty * TILE_SIZE + HEIGHT / 2 - player_y
				);
			}else{
				tile_data(screen_2D,
					tx * TILE_SIZE + WIDTH / 2 - player_x,
					ty * TILE_SIZE + HEIGHT / 2 - player_y,
					Map_Data.data[py * MAP_WIDTH + px].texture);

				// if((py === MAP_HEIGHT - 1 || py === 0) || (px === MAP_WIDTH - 1 || px === 0)){
				// 	gradient_tile_data(screen_2D, px, py);
				// }  画面端グラデーション失敗
			}
		}
	}
	screen_2D.beginPath();
		screen_2D.globalAlpha = 1;
	screen_2D.closePath();

	other_users.forEach((user) => {
		other_images(user[0], user[1], user[2], user[3], user[5]);
	});
	///////////////	自分の画像表示
	if(( m == 2 ) && move_x == 0 && move_y == 0){
		sit_chair(player_img, WIDTH / 2 - CHR_WIDTH / 2, HEIGHT / 2 - CHR_HEIGHT + TILE_SIZE / 2);
	}else{

		screen_2D.drawImage(
			player_img,
			(frame_count >> 5 & 1) * CHR_WIDTH,
			player_angle * CHR_HEIGHT,
			CHR_WIDTH,
			CHR_HEIGHT,
			WIDTH / 2 - CHR_WIDTH / 2,
			HEIGHT / 2 - CHR_HEIGHT + TILE_SIZE / 2,
			CHR_WIDTH,
			CHR_HEIGHT
		);

	}


	/////////////////////////////////
	function other_images(other_icon, other_x, other_y, other_angle, judge) {
		let other_idx_x = (other_x + 8) / TILE_SIZE - 1;
		let other_idx_y = (other_y + 8) / TILE_SIZE - 1;
		let other_idx = other_idx_x + other_idx_y * 32;

		if(Map_Data.data[Math.floor(other_idx)].texture == 2 && judge == 0 && Number.isInteger(other_idx_y) == true && Number.isInteger(other_idx_x) == true){
			sit_chair(other_icon, WIDTH / 2 - CHR_WIDTH / 2 - (player_x - other_x), HEIGHT / 2 - CHR_HEIGHT + TILE_SIZE / 2 - (player_y - other_y));
			top_monitor(other_idx_x, other_idx_y, 1);
		}else{

			screen_2D.drawImage(
				other_icon,
				(frame_count >> 5 & 1) * CHR_WIDTH, //キャラ画像の種類選別・２進数右シフトで0,1を判断
				other_angle * CHR_HEIGHT, //キャラ画像の種類選別（高さ）
				CHR_WIDTH,  //キャラ画像の幅
				CHR_HEIGHT, //キャラ画像の高さ
				WIDTH / 2 - CHR_WIDTH / 2 - (player_x - other_x),
				HEIGHT / 2 - CHR_HEIGHT + TILE_SIZE / 2 - (player_y - other_y),
				CHR_WIDTH,
				CHR_HEIGHT
			);
			other_idx = Math.round(other_idx_x) + Math.round(other_idx_y) * 32;
			if(Map_Data.data[other_idx].texture == 2 && judge == 1){
				top_monitor(Math.round(other_idx_x), Math.round(other_idx_y), 0);
			}
		}
	};
	function sit_chair(img, x, y){
		screen_2D.drawImage(
			img,
			0, //キャラ画像の種類選別 0 or 16
			48, //キャラ画像の種類選別（高さ）0 ~ 48
			CHR_WIDTH,  //キャラ画像の幅 16
			3, //キャラ画像の高さ 1 ~ 16
			x, //貼り付ける場所
			y, //貼り付ける場所
			CHR_WIDTH, //貼り付ける幅
			3 //貼り付ける高さ
		);
	}
}
function tile_data(g, x, y, idx) {
	g.beginPath();
		g.globalAlpha = 1;
	g.closePath();
	const ix = (idx % TILE_COLUMN) * TILE_SIZE;
	const iy = Math.floor(idx / TILE_COLUMN) * TILE_SIZE;
	g.drawImage(map_img, ix, iy, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
}
function over_tile_data(g, x, y) {
	g.beginPath();
		g.fillStyle = 'black';
		g.globalAlpha = 0.7;
		g.fillRect(x, y, TILE_SIZE, TILE_SIZE);
	g.closePath();
}
function gradient_tile_data(g, x, y){
	let tile_angle = {};
	switch (true) {
        case x === 0 && y === 0: //左上の角
			tile_angle = {start_x: TILE_SIZE, start_y: TILE_SIZE, end_x: 0, end_y: 0};
            break;
        case x === MAP_WIDTH && y === 0: //右上の角
			tile_angle = {start_x: 0, start_y: TILE_SIZE, end_x: TILE_SIZE, end_y: 0};
            break;
        case x === 0 && y === MAP_HEIGHT: //左下の角
			tile_angle = {start_x: TILE_SIZE, start_y: 0, end_x: 0, end_y: TILE_SIZE};
            break;
        case x === MAP_WIDTH && y === MAP_HEIGHT: //右下の角
			tile_angle = {start_x: 0, start_y: 0, end_x: TILE_SIZE, end_y: TILE_SIZE};
            break;
        case x != 0 && y === 0: //上辺
			tile_angle = {start_x: 0, start_y: TILE_SIZE, end_x: 0, end_y: 0};
            break;
        case x != 0 && y === MAP_HEIGHT: //下辺
			tile_angle = {start_x: 0, start_y: 0, end_x: 0, end_y: TILE_SIZE};
            break;
        case x === 0 && y != 0: //左辺
			tile_angle = {start_x: TILE_SIZE, start_y: 0, end_x: 0, end_y: 0};
            break;
        case x === MAP_WIDTH && y != 0: //右辺
			tile_angle = {start_x: 0, start_y: 0, end_x: TILE_SIZE, end_y: 0};
            break;
        default:
			tile_angle = {start_x: 0, start_y: 0, end_x: 0, end_y: 0};
    }

	let tile_x = (x + 1) * TILE_SIZE - 8;
	let tile_y = (y + 1) * TILE_SIZE - 8;
	// console.log(WIDTH / 2 - CHR_WIDTH / 2 - (player_x - tile_x));
	g.beginPath();
		const gradient = g.createLinearGradient(tile_angle.start_x, tile_angle.start_y, tile_angle.end_x,tile_angle.end_y);
		gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');    // 開始点（左端）の色
        // gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)'); // 中間点の色
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');   // 終了点（右端）の色
		g.fillStyle = gradient;
		g.fillRect(
			WIDTH / 2 - CHR_WIDTH / 2 - (player_x - tile_x),
			HEIGHT / 2 - CHR_HEIGHT + TILE_SIZE / 2 - (player_y - tile_y),
			TILE_SIZE,
			TILE_SIZE
			);
	g.closePath();


}
function load_img() {
	map_img = new Image();
	map_img.src = MAP_FILE;		//	マップ画像読み込み
	map_img.onload = function () {
		player_img = new Image();
		player_img.src = player_file;	//	プレイヤー画像読み込み
	};
}
//	フィールド進行処理(サーバ・クライアント)
function key_event() {
	let move_judge = 0;
	if (move_x != 0 || move_y != 0) { }				//	移動中の場合
	else if (gKey[65]) { player_angle = 2; move_x = -TILE_SIZE; other_move_x = TILE_SIZE; move_judge = 1; socket.emit('move-judge', 1);}	//	左
	else if (gKey[87]) { player_angle = 3; move_y = -TILE_SIZE; other_move_y = TILE_SIZE; move_judge = 1; socket.emit('move-judge', 1);}	//	上
	else if (gKey[68]) { player_angle = 1; move_x = TILE_SIZE; other_move_x = -TILE_SIZE; move_judge = 1; socket.emit('move-judge', 1);}	//	右
	else if (gKey[83]) { player_angle = 0; move_y = TILE_SIZE; other_move_y = -TILE_SIZE; move_judge = 1; socket.emit('move-judge', 1);}	//	下
	else if ((move_x == 0) && (move_y == 0)) { 	socket.emit('move-judge', 0); return; }
	//	移動後のタイル座標判定
	let mx = Math.floor((player_x + move_x) / TILE_SIZE);	//	移動後のタイル座標X
	let my = Math.floor((player_y + move_y) / TILE_SIZE);	//	移動後のタイル座標Y

	mx += MAP_WIDTH;								//	マップループ処理X
	mx %= MAP_WIDTH;								//	マップループ処理X
	my += MAP_HEIGHT;								//	マップループ処理Y
	my %= MAP_HEIGHT;								//	マップループ処理Y
	m = Map_Data.data[my * MAP_WIDTH + mx].texture;		//	タイル番号
	c = Map_Data.data[my * MAP_WIDTH + mx].call;		//	コール名
	move_name = Map_Data.data[my * MAP_WIDTH + mx].move.name;
	move_num = Map_Data.data[my * MAP_WIDTH + mx].move.num;


	if ((m >= 3 && m < 25) || m > 25) {	//	侵入不可の地形の場合 （2番以下と25番は移動可能
		move_x = 0;									//	移動禁止X
		move_y = 0;									//	移動禁止Y
		return;
	}

	other_users.forEach((user) => {
		let stop_idx_x = (user[1] + 8) / TILE_SIZE - 1;
		let stop_idx_y = (user[2] + 8) / TILE_SIZE - 1;
		let stop_idx = stop_idx_x + stop_idx_y * 32;
		if((my * MAP_WIDTH + mx) == stop_idx){
			move_x = 0;									//	移動禁止X
			move_y = 0;									//	移動禁止Y
			m = "";
			c = "";
			move_name = "";
			move_num = "";
			return;
		}
	});

	if ((c != "") && c != call_name) {
		stop_call(call_name);
		start_call(meta_map_id + '-' + c, c);
		call_name = c;
		first_call = 1;
		console.log("start call...");
	} else if (((c == "") && c != call_name) | init_call === 0 ) {
		if(init_call !== 0){
			first_call = 0;
			stop_call(call_name);
				if(move_x != 0){
					top_monitor(mx - move_x / 16, my, first_call);
				}else if(move_y != 0){
					top_monitor(mx, my - move_y / 16, first_call);
				}
		}
		call_name = c;
		start_call(meta_map_id + '-' + c, c);
		console.log("stop call...");
		init_call = 1;
	}

	player_x += Math.sign(move_x);				//	プレイヤー座標移動X
	player_y += Math.sign(move_y);				//	プレイヤー座標移動Y
	other_x -= Math.sign(other_move_x);
	other_y -= Math.sign(other_move_y);

	move_x -= Math.sign(move_x);					//	移動量消費X
	move_y -= Math.sign(move_y);					//	移動量消費Y
	other_move_x -= Math.sign(other_move_x);					//	移動量消費X
	other_move_y -= Math.sign(other_move_y);					//	移動量消費Y


	if(move_x == 0 && move_y == 0 && move_name != ""){
		meta_map_id = move_name;
		if(init_call !== 0){
			stop_call(call_name);
		}
		map_change(move_name, move_num);
		start_call(meta_map_id + '-' + c, c);
	}
	socket.emit('movement', {
		player_x: player_x,
		player_y: player_y,
		player_angle: player_angle,
		player_move: move_judge
	});
	///////////////////////////////////////
	// //	マップループ処理
	player_x += (MAP_WIDTH * TILE_SIZE);
	player_x %= (MAP_WIDTH * TILE_SIZE);
	player_y += (MAP_HEIGHT * TILE_SIZE);
	player_y %= (MAP_HEIGHT * TILE_SIZE);

	if(first_call == 1 && move_x == 0 && move_y == 0){
		top_monitor(mx, my, first_call);
	}
}

function top_monitor(x, y, power){
	if(y > 0){
		y -= 1;
	}
	if((Map_Data.data[ x + y * 32 ].texture >= 9 && Map_Data.data[ x + y * 32 ].texture <= 11 ) || (Map_Data.data[ x + y * 32 ].texture >= 15 && Map_Data.data[ x + y * 32 ].texture <= 17)){
		let power_change = 6;
		if(power == 0){
			power_change = -6;
		}
		if((Map_Data.data[ x + y * 32 ].texture >= 9 && Map_Data.data[ x + y * 32 ].texture <= 11 && power_change == 6) || (Map_Data.data[ x + y * 32 ].texture >= 15 && Map_Data.data[ x + y * 32 ].texture <= 17 && power_change == -6)){
			Map_Data.data[ x + y * 32 ].texture += power_change;
		}
	}else{
		return;
	}


}


function map_paint() {
	main();

	const ca = document.getElementById("meta_map");	//	meta_mapキャンバスの要素を取得
	const g = ca.getContext("2d");				//	2D描画コンテキストを取得
	g.clearRect(0, 0, ca.width, ca.height);
	g.drawImage(virtual_screen, 0, 0, virtual_screen.width, virtual_screen.height, 0, 0, window_width, window_height);//	仮想画面のイメージを実画面へ転送
	const ca_name = document.getElementById("meta_name");	//	meta_nameキャンバスの要素を取得
	ca_name.width = ca.width;	//meta_mapとmeta_nameのキャンバスのサイズを一致
	ca_name.height = ca.height; //meta_mapとmeta_nameのキャンバスのサイズを一致
	const g_name = ca_name.getContext("2d");				//	2D描画コンテキストを取得
	let ratio = ca.width / 256;	//仮想1ピクセルあたりの実際のピクセル数を計測

	g_name.font = '16px Arial';
	const textWidth = g_name.measureText(myName).width;
	g_name.beginPath();//名前後ろ背景を作成
		g_name.lineWidth = 24;
		g_name.strokeStyle = 'rgba(80, 80, 80, 0.75)';
		g_name.lineCap = 'round';
		g_name.moveTo(ca.width / 2 - textWidth / 2 - 1, ratio * 55 - 6);
		g_name.lineTo(ca.width / 2 - textWidth / 2 + textWidth + 1, ratio * 55 - 6);
	g_name.stroke();

	g_name.fillStyle = 'rgb(255, 255, 255)'; //名前を作成
	g_name.textAlign = 'center';
	g_name.fillText( myName, ca.width / 2, ratio * 55);



	other_users.forEach((user) => {
		other_names(user[4], user[1], user[2]);
	});


	function other_names(other_name, other_x, other_y){
		let dif_x = (player_x - other_x) * ratio;
		let dif_y = (player_y - other_y) * ratio;

		g_name.beginPath(); //名前後ろ背景を作成
			g_name.moveTo( ca.width / 2  - dif_x - textWidth / 2 - 1, ( ratio * 55 ) - dif_y - 6);
			g_name.lineTo( ca.width / 2  - dif_x - textWidth / 2 + textWidth + 1, ( ratio * 55 ) - dif_y - 6);
		g_name.stroke();
		g_name.fillText(other_name,( ca.width / 2 ) - dif_x,( ratio * 55 ) - dif_y); //名前を作成

	};


}




//	ブラウザサイズ変更イベント
function re_size() {
	const ca = document.getElementById("meta_map");	//	meta_mapキャンバスの要素を取得
	ca.width = window.innerWidth;	//画面全体サイズ				//	キャンバスの幅をブラウザの幅へ変更
	ca.height = window.innerHeight;	//画面全体サイズ				//	キャンバスの高さをブラウザの高さへ変更

	const g = ca.getContext("2d");				//	2D描画コンテキストを取得
	g.clearRect(0, 0, ca.width, ca.height);

	g.imageSmoothingEnabled = g.msImageSmoothingEnabled = SMOOTH;	//	補間処理

	//	実画面サイズを計測。ドットのアスペクト比を維持したままでの最大サイズを計測する。
	window_width = ca.width;
	window_height = ca.height;
	if (window_width / WIDTH < window_height / HEIGHT) {
		window_height = window_width * HEIGHT / WIDTH;
	} else {
		//window_width = window_height * WIDTH / HEIGHT;
	}

	let header_width = $('header').width();
	$('.overflow-h').css('width', header_width);

	window.resizeTo(1590, 890);  //画面強制リサイズ

}


//	タイマーイベント発生時の処理
function timer() {
	frame_count++;						//	内部カウンタを加算
	if (!$('.chatbtn').hasClass('active')) {
		key_event();					//	フィールド進行処理
	}
	map_paint();
}


//	キー入力(DOWN)イベント
window.onkeydown = function (ev) {
	let c = ev.keyCode;			//	キーコード取得
	gKey[c] = 1;
}


//	キー入力(UP)イベント
window.onkeyup = function (ev) {
	gKey[ev.keyCode] = 0;
}


//	ブラウザ起動イベント
window.onload = function () {
	add_slide();
	virtual_screen = document.createElement("canvas");	//	仮想画面を作成
	virtual_screen.width = WIDTH;							//	仮想画面の幅を設定
	virtual_screen.height = HEIGHT;						//	仮想画面の高さを設定
	name_screen = document.createElement("canvas");
	re_size();										//	画面サイズ初期化
	window.addEventListener("resize", function () {
		re_size();
	});	//	ブラウザサイズ変更時、re_size()が呼ばれるよう指示

	Promise.all([get_session_data]).then(() => {
		if(permission >= 3){
			$('#permission').append(`
			  <button class="my_japanese_font" id="map-edit">マップ編集</button>
			`);
			$('#map-edit').on('click', function(){
			  window.location.href = `https://i-seifu-freedrink.com/map_edit?image=${meta_map_id.split('-')[0]}&worldID=${World_ID}&mapID=${meta_map_id}&file=host_permission`;
			});
		};
		START_X = Map_Data.spawn % 32;
		START_Y =(Map_Data.spawn - START_X) / 32;
		player_x = START_X * TILE_SIZE + TILE_SIZE / 2;	//	プレイヤー座標X
		player_y = START_Y * TILE_SIZE + TILE_SIZE / 2;	//	プレイヤー座標Y

		load_img();
		}).then(()=>{
		setInterval(function () {
			timer();
		}, 25);		//	50ms間隔で、timer()を呼び出すよう指示（約50fps）
	});
	socket.on('state', (players) => {
		other_users = [];
		Object.values(players).forEach((player) => {
			let dif_Y = player.y - player_y;
			let dif_X = player.x - player_x;
			if ((dif_Y > -144 && dif_Y < 144) &&
				(dif_X > -144 && dif_X < 144) && //画面範囲ギリギリ
				(myID != player.playerID)){ //自分は含めない {
				other_x = player.x;
				other_y = player.y;
				other_angle = player.angle;
				other_move_judge = player.move;
				other_icon = player.icon;
				other_icon_file = "images/icon_img/" + other_icon;
				other_name = player.playerName;
				let new_image;
				new_image = new Image();
				new_image.src = other_icon_file;

				let user = [new_image, other_x, other_y, other_angle, other_name, other_move_judge];
				other_users.push(user);
			}
		});
	});
}

