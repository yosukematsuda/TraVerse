
function add_slide() {
    $(".swiper-slide").on("mousedown touchstart", mdown);

    var x;
    var y;

    function mdown(e) {
        if (e.type === "oncontextmenu" || e.button !== 0) return; // Ignore right-clicks and non-left-clicks

        $(this).removeClass("videoMargin").addClass("drag");

        var event;
        if (e.type === "mousedown") {
            event = e;
        } else {
            event = e.changedTouches[0];
        }

        x = event.pageX - this.offsetLeft;
        y = event.pageY - this.offsetTop;

        $(document.body).on("mousemove touchmove", mmove);
    }

    function mmove(e) {
        var drag = $(".drag").eq(0);

        var event;
        if (e.type === "mousemove") {
            event = e;
        } else {
            event = e.changedTouches[0];
        }

        e.preventDefault();

        drag.css("top", event.pageY - y + "px");
        drag.css("left", event.pageX - x + "px");

        drag.on("mouseup touchend", mup);
        $(document.body).on("mouseleave touchleave", mup);
    }

    function mup(e) {
        var drag = $(".drag").eq(0);

        $(document.body).off("mousemove touchmove", mmove);
        drag.off("mouseup touchend", mup);
        drag.before($('.swiper-slide').eq(-1));
        // console.log($('.swiper-slide').eq(-1));
        drag.removeClass("drag");

    }
}
