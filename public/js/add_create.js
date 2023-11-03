"use strict";
const socket = io();
let room, sessionData, myID, myName, myIcon, peer;
var xhr = new XMLHttpRequest();
xhr.open('GET', '/api/session-data', true);
xhr.onload = function () {
	$('#create_form').attr({
		method: 'post',
		action: '/post/add_createDB',
		onsubmit: 'return Check()'
	});
	if (xhr.status === 200) {
		sessionData = JSON.parse(xhr.responseText);
		myID = sessionData.passport.user.id;
		$("<input>",{type: 'hidden', name: "map_admin",id:'map-admin', value: myID}).appendTo('#create_form');
		$("<input>",{type: 'text', name: "map_name",id: 'map-name'}).appendTo('#create_form');
		$("<input>",{type: 'submit', id:'create-btn', value: "マップ追加"}).appendTo('#create_form');
        $("#create-btn").on('click', function (){
            console.log(map_data, new_map_id, world_id);
            if(document.getElementById('map-name').value != ""){
                socket.emit('add-data', {
                    map_data: map_data,
                    new_map_id: new_map_id,
                    world_id: world_id
                });

            }
        });
		myName = sessionData.passport.user.username;
		myIcon = sessionData.passport.user.icon;
		console.log(sessionData);
	} else {
		console.error('Request failed. Status:', xhr.status);
	}
};
xhr.send();
const	FONT		= "48px monospace";
const	HEIGHT		= 512;
const	WIDTH		= 512;
const	MAP_HEIGHT	= 32;
const	MAP_WIDTH	= 32;
const	SMOOTH		= 0;
const	TILECOLUMN	= 6;
const	TILEROW		= 7;
const	TILESIZE	= 16;




let		gFrame = 0;
let		gHeight;
let		gWidth;
let		gImgMap;
let		gScreen;

let     call_delete = false;
let		edit_img;
let		call_dist_num;
let		move_map_num;
let 	color_code;
let 	call_name;
let		add_judge_array = [];
let		call_count = 0;
let		add_judge;
let		spawn_select = false;
let		spawn_done;

let		Map_Files=[];
let		other_maps = [];
const urlParams = new URLSearchParams(window.location.search);
const image_num = urlParams.get('value');
const world_id = urlParams.get('world-id');
$("<input>",{type: 'hidden', id:'world-id', name: 'world_id', value: world_id}).appendTo('#create_form');
const	MAP_FILE = "images/map_img/" + image_num + '.png';
let new_map_id;
let map_data ={data:[], spawn: -1};
for(let i = 0; i < 1024; i++){
    let cells = {texture: 0, call: '', move: {name: '', num: 0}, any: 0};
    map_data.data.push(cells);
}

function DrawMain(){
	const	g = gScreen.getContext( "2d" );
	g.clearRect(0, 0, gScreen.width, gScreen.height);
	for( let y = 0; y < 32; y++ ){
		for( let x = 0; x < 32; x++ ){
			DrawTile( g, x * TILESIZE, y * TILESIZE, map_data.data[ y * MAP_WIDTH + x ].texture );
		}
	}
	for( let y = 0; y < 32; y++ ){
		for( let x = 0; x < 32; x++ ){
			g.beginPath();
				g.strokeStyle = 'gray';
				g.lineWidth = 0.8;
				g.strokeRect( x * TILESIZE,  y * TILESIZE, TILESIZE, TILESIZE);
			g.closePath();
			if( map_data.data[ y * MAP_WIDTH + x ].call != "" && $('input[value="'+ map_data.data[ y * MAP_WIDTH + x ].call +'"]')){
				color_code = $('input[value="'+ map_data.data[ y * MAP_WIDTH + x ].call +'"]').attr('color');
				g.beginPath();
					g.fillStyle = color_code;
					g.globalAlpha = 0.5;
					g.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);
				g.closePath();
			}
		}
	}
}


function DrawTile( g, x, y, idx ){
	g.beginPath();
		g.globalAlpha = 1;
	g.closePath();
	const		ix = ( idx % TILECOLUMN ) * TILESIZE;
	const		iy = Math.floor( idx / TILECOLUMN ) * TILESIZE;
	g.drawImage( gImgMap, ix, iy, TILESIZE, TILESIZE, x, y, TILESIZE, TILESIZE );
}

function WmPaint(){
	DrawMain();
	const	ca = document.getElementById( "new-create" );
	const	g = ca.getContext( "2d" );
	g.drawImage( gScreen, 0, 0, gScreen.width, gScreen.height, 0, 0, gWidth, gHeight );
}
function load_paint(){
	let edit_idx = 0;
	for(let y = 0; y <= 64; y+=16 ){
		for(let x = 0; x <= 80; x+=16 ){
			edit_11("edit-" + edit_idx, x, y);
			edit_idx++;
			if(edit_idx > 25){
				break;
			}
		}
	}
	function edit_11(id_name, img_X, img_Y){
		let edit_canvas;
		let	graphic;
		new Promise((resolve) => {
			edit_canvas = document.getElementById( id_name );
			graphic = edit_canvas.getContext( "2d" );
			edit_canvas.width = 40;
			edit_canvas.height = 40;
			graphic.imageSmoothingEnabled = graphic.msImageSmoothingEnabled = SMOOTH;
			resolve();
		}).then(() => {
			graphic.drawImage(gImgMap, img_X, img_Y, 16, 16, 0, 0, edit_canvas.width, edit_canvas.height);
		});
	}
}
function WmSize(){
	const	ca = document.getElementById( "new-create" );
	const	header = document.getElementById("header-menu");
	main_ca_size = window.innerHeight - header.clientHeight;
	if(main_ca_size > window.innerWidth){
		main_ca_size = window.innerWidth;
	}
	ca.width = main_ca_size;
	ca.height = main_ca_size;
	gWidth = main_ca_size;
	gHeight = main_ca_size;
	const	g = ca.getContext( "2d" );
	g.clearRect(0, 0, ca.width, ca.height);
	g.imageSmoothingEnabled = g.msImageSmoothingEnabled = SMOOTH;
    WmPaint();
}



window.onload = function(){
    gImgMap = new Image();
    gImgMap.src = "images/map_img/" + image_num + '.png';
    gScreen = document.createElement( "canvas" );
    gScreen.width = WIDTH;
    gScreen.height = HEIGHT;
    gImgMap.onload = function(){
		load_paint();
        WmSize();
    }
    let random = Math.floor(Math.random() * 1000000000);
	new_map_id = image_num + '-' + random;
	// $("<input>",{type: 'button', id:'spawn-distinction', name: 'new_map_id', value: 'スポーン位置選択', onClick: 'spawn_position();'}).prependTo('#detail');
	$("<input>",{type: 'hidden', id:'map-id', name: 'map_id', value: new_map_id}).appendTo('#create_form');
	new Promise((resolve) => {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', `/api/get-all-map-DB?WorldID=` + WORLD_ID, true);
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
	}).then(()=>{
		let delete_idx = Map_Files.findIndex((elem)=> elem === MAP_ID );
		Map_Files.splice(delete_idx, 1);
		if(Map_Files != null){
			get_all_map_data(Map_Files);
		}
	});



}
window.addEventListener("resize", function(){
	window.resizeTo(1590, 890);
    WmSize();
	const node = document.getElementById("move-map");
	while(node.firstChild){
  		node.removeChild(node.firstChild);
	}
	other_maps.forEach((map)=>{
		create_canvas(map.name, map.data);
	});

});

$(".edit").on('click', function(e){
	edit_img = parseInt(e.target.id.slice(-2), 10);
	color_code = null;
    call_name = null;
    call_delete = false;
});



$("#add-button").on('click', function(){
	if($("#add-name").val() == ""){
		alert("会議室名を入力して下さい。");
		return;
	}else{
		add_judge = 1;
		for(let i = 0; i < call_count; i++){
			if($("#add-name").val() == add_judge_array[i]){
				add_judge = 0;
				break;
			}
		}
		if(add_judge == 0){
			alert("既に会議室名に存在します。");
		}else{
			color_code = RandomColor();
			$("#dist-table").append('<input type="button" class="dist" value= "' + $("#add-name").val() +'" color="' + color_code + '">');
			$(".dist").on('click', function(e){
				call_name = e.target.value;
				color_code = e.target.color;
				edit_img = null;
                call_delete = false;
			});
			add_judge_array[call_count] = $("#add-name").val();
			call_count++;
		}
	}
});


$("#delete").on('click', function(){
    call_name = "";
    edit_img = null;
    color_code = null;
    edit_img = null;
    call_delete = true;
});
$("#call-distinction").on('click', function(){
	edit_img = null;
    call_delete = false;
	spawn_select = false;
	$("#dist-table").toggleClass("hide_window"); //画面の表示、非表示
});
const Dist_Form = document.forms.dist_table;
$(".dist").on('click', function(e){
	call_name = e.target.value;
    color_code = null;
	edit_img = null;
    call_delete = false;
	spawn_select = false;
});
$("#move-map").on('click', function(){
	call_name = null;
	edit_img = null;
	color_code = null;
	spawn_select = false;
	call_delete = false;
	//$("#move-map").toggleClass("hide_window"); //画面の表示、非表示
});
$("#close").on('click', function(){
	map_data.data[move_idx].texture = change_before;
	WmPaint();
	$("#move-map").toggleClass("hide_window");
});





function call_dist(value){
	if(value == null){
		return;
	}
	let hexString = '';
	for (let i = 0; i < value.length; i++) {
		const charCode = value.charCodeAt(i);
		const hexChar = charCode.toString(16).toUpperCase();
		hexString += hexChar;
	}
	hexString = hexString.slice(-6);
	return hexString;
} //引数(文字列)から１６進数６桁を作成する関数




let	canvas = document.getElementById( "new-create" );
canvas.addEventListener('click', (e) => {
	const rect = e.target.getBoundingClientRect();
	const	idx_width = 32;
	const	idx_height = 32;
	let	box_width = canvas.width;
	let	box_height = canvas.width;
	if(canvas.width > canvas.height){
		box_width = canvas.height;
		box_height = canvas.height;
	}
	box_width  /=  idx_width;
	box_height /= idx_height;
	// ブラウザ上での座標を求める
    const   viewX = e.clientX - rect.left;
    const   viewY = e.clientY - rect.top;

	// ブラウザ上でのクリック座標をキャンバス上に変換
    const	canvasX = Math.floor( viewX / box_width );
    const	canvasY = Math.floor( viewY / box_height );
	//教室編集の書き換え
    if(edit_img != null){
        let map_num = canvasX + (canvasY * 32);
		change_before = map_data.data[map_num].texture;
        map_data.data[map_num].texture = edit_img;
		if(edit_img == 25){
			move_idx = map_num;
			$("#move-map").toggleClass("hide_window");
		}
    }
	//通話エリアの書き換え
	if(call_name != null){
		let map_num = canvasX + (canvasY * 32);
		map_data.data[map_num].call = call_name;
	}
	//通話エリア削除
	if(call_delete === true){
		let map_num = canvasX + (canvasY * 32);
		map_data.data[map_num].call = "";
	}


	console.log(map_data);
    WmPaint();
});



function Check(){
    if(document.getElementById('map-name').value == ""){
		alert("マップ名を入力して下さい。");
		return false;
    }else{
		return true;
	}
};

function RandomColor() {	//ランダムにカラーコード６桁抽出
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
	  color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
function get_all_map_data(Map_Files){
	for(const File_Name of Map_Files){
		const PATH = 'data_map/' + WORLD_ID + '/' + File_Name + '.json';
		let other_map_data;
		new Promise((resolve) => {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', `/api/json-map-data?file_name=${PATH}`, true);
			xhr.onload = function () {
				if (xhr.status === 200) {
					other_map_data = JSON.parse(xhr.responseText);
					resolve();
				}else{
					console.error('Request failed. Status:', xhr.status);
					resolve();
				};
			};
			xhr.send();
		}).then(()=>{
			other_maps.push({name: File_Name, data: other_map_data});
			create_canvas(File_Name, other_map_data);
		});
	};
};

function create_canvas(file_name, file_data){
	let move_table_w = Math.floor(window.innerWidth * 0.36);
	let other_tile_size = move_table_w / 32;
	let map_img = new Image();
	map_img.src = 'images/map_img/' + file_name.split('-')[0] + '.png';
	const act_canvas = document.createElement("canvas");
	act_canvas.id = file_name;
	act_canvas.width = move_table_w;
	act_canvas.height = move_table_w;
	const ctx = act_canvas.getContext('2d');
	ctx.clearRect(0, 0, act_canvas.width, act_canvas.height);
	map_img.onload = function () {
		ctx.imageSmoothingEnabled = ctx.msImageSmoothingEnabled = 0;
		for( let y = 0; y < 32; y++ ){
			for( let x = 0; x < 32; x++ ){
				OtherTile( ctx, x * other_tile_size, y * other_tile_size, file_data.data[ y * MAP_WIDTH + x ].texture );
			};
		};
	};
	function OtherTile( g, other_x, other_y, idx ){
		const ix = ( idx % TILECOLUMN ) * TILESIZE;
		const iy = Math.floor( idx / TILECOLUMN ) * TILESIZE;
		g.drawImage( gImgMap, ix, iy, TILESIZE, TILESIZE, other_x, other_y, other_tile_size, other_tile_size );
	}
	document.getElementById("move-map").appendChild(act_canvas);
	canvas_coordinate(act_canvas.id, file_data, 32, 32);
};

function canvas_coordinate(id, file_data, idx_w, idx_h){ //canvas_coordinate(canvasのid, canvasの最大x軸の升目, canvasの最大y軸の升目)//canvasクリック時の相対座標を{x, y, idx}で返す。
	let result = {};
	let	canvas = document.getElementById(id);
	canvas.addEventListener('click', (e) => {
		const rect = e.target.getBoundingClientRect();
		const	idx_width = idx_w;
		const	idx_height = idx_h;
		let	box_width = canvas.width;
		let	box_height = canvas.width;
		if(canvas.width > canvas.height){
			box_width = canvas.height;
			box_height = canvas.height;
		}
		box_width  /=  idx_width;
		box_height /= idx_height;
		// ブラウザ上での座標を求める
		const   viewX = e.clientX - rect.left;
		const   viewY = e.clientY - rect.top;

		// ブラウザ上でのクリック座標をキャンバス上に変換
		const	canvasX = Math.floor( viewX / box_width );
		const	canvasY = Math.floor( viewY / box_height );
		result = {id: id, data: file_data, x: canvasX, y: canvasY, idx: canvasX + (canvasY * 32)};
		other_click(result.id, result.data, result.idx);
	});
};

function other_click(id, other_map, idx){
	let conf_check = window.confirm('移動設定を確定しますか？');
	if(conf_check == true){
		let random = Math.floor(Math.random() * 1000000000);
		other_map.data[idx].texture = edit_img;
		other_map.data[idx].move.name = MAP_ID;
		other_map.data[idx].move.num = random;
		map_data.data[move_idx].move.name = id;
		map_data.data[move_idx].move.num = random;
		$("#move-map").toggleClass("hide_window");
		socket.emit('edit-data', {
			map_data: other_map,
			map_id: id,
			world_id: WORLD_ID
		});
		socket.emit('edit-data', {
			map_data: map_data,
			map_id: MAP_ID,
			world_id: WORLD_ID
		});

	}
}
