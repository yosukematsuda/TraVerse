function checkStartCall(numberOfCallingPeople) {
  $('.swiper-slide').addClass('enterToRoom' + numberOfCallingPeople);
}

function checkStopCall(){
  $('.swiper-slide').removeClass('enterToRoom1');
  $('.swiper-slide').removeClass('enterToRoom2');
  $('.swiper-slide').removeClass('enterToRoom3');
  $('.swiper-slide').removeClass('enterToRoom4');
  $('.swiper-slide').removeClass('enterToRoom5');
}

// ハンバーガーメニュー

$(".openbtn").click(function () {//ボタンがクリックされたら
	$(this).toggleClass('active');//ボタン自身に activeクラスを付与し
    $("#g-nav").toggleClass('panelactive');//ナビゲーションにpanelactiveクラスを付与
});

$("#g-nav a").click(function () {//ナビゲーションのリンクがクリックされたら
    $(".openbtn").removeClass('active');//ボタンの activeクラスを除去し
    $("#g-nav").removeClass('panelactive');//ナビゲーションのpanelactiveクラスも除去
});

// 会話履歴メニュー

$("#openTalkListBtn").click(function () {//ボタンがクリックされたら
  $("#t-nav").addClass('panelactive');//ナビゲーションにpanelactiveクラスを付与
});

$("#closeTalkListBtn").click(function () {//ナビゲーションのリンクがクリックされたら
  $("#t-nav").removeClass('panelactive');//ナビゲーションのpanelactiveクラスも除去
});

// チャット

$(".chatbtn").click(function () {//ボタンがクリックされたら
	$(this).toggleClass('active');//ボタン自身に activeクラスを付与し
    $("#c-nav").toggleClass('panelactive');//ナビゲーションにpanelactiveクラスを付与
});

$("#g-nav a").click(function () {//ナビゲーションのリンクがクリックされたら
    $(".chatbtn").removeClass('active');//ボタンの activeクラスを除去し
    $("#gc-nav").removeClass('panelactive');//ナビゲーションのpanelactiveクラスも除去
});

if($('#sub-box').outerWidth(true) <= 700){
  $('.tabs').css('width',$('#sub-box').outerWidth(true));
};

//スクロールをするとハンバーガーメニューに変化するための設定を関数でまとめる
// function FixedAnime() {
// 	//ヘッダーの高さを取得
// 	var headerH = $('#header').outerHeight(true);
// 	var scroll = $(window).scrollTop();
// 	if (scroll >= headerH){//ヘッダーの高さ以上までスクロールしたら
// 			$('.cjatbtn').addClass('fadeDown');//.openbtnにfadeDownというクラス名を付与して
// 			$('#chatHeader').addClass('dnone');//#headerにdnoneというクラス名を付与
// 		}else{//それ以外は
// 			$('.chatbtn').removeClass('fadeDown');//fadeDownというクラス名を除き
// 			$('#chatHeader').removeClass('dnone');//dnoneというクラス名を除く
// 		}
// }

// 画面をスクロールをしたら動かしたい場合の記述
// $(window).scroll(function () {
// 	FixedAnime();//スクロールをするとハンバーガーメニューに変化するための関数を呼ぶ
// });

// // ページが読み込まれたらすぐに動かしたい場合の記述
// $(window).on('load', function () {
// 	FixedAnime();//スクロールをするとハンバーガーメニューに変化するための関数を呼ぶ
// });



let invite_button = document.getElementById('invite-url');
if(invite_button){
  invite_button.addEventListener(("click"),function(e){
    navigator.clipboard.writeText(e.target.value);
  });
}
