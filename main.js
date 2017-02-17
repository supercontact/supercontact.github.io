var currentTime = 0;
var scrollBarButtonHeight = 14;
var scrollPos = 0;
var autoScrollPos = {value: 0};
var autoScrolling = false;
var focusedArticle = -1;
var expandingArticle = -1;
var expandTimer = 0;
var expandDuration = 100;
var expandedArticle = -1;
var gearSize = 80;
var articles;
var cardHeight = 240;
var cardWidth = 200;
var cardGalleryPosY = -60;
var articleLoaded = 0;
var articleHeight = 1200;
var articleWidth = 1000;
var articleGap = 100;
var articleDeployHeight = 0;
var articlesDeployed = false;
var articleBackgroundImageAlpha = 0.06;
var articleImgLinePos = [];
var articleImgCount = [];

function resizing() {
	$("#first").height(window.innerHeight);
	var bg = $(".bg");
	var width = 2 * window.innerHeight * bg.width() / bg.height();
	if (width > $("body").innerWidth()) {
		bg.width(width);
		bg.css("left", ($("body").innerWidth() - width) / 2 + "px");
	} else {
		bg.width("100%");
		bg.css("left", 0);
	}
	$(window).scrollTop(scrollPos);
	scrolling();
}

function scrolling() {
	scrollPos = $(window).scrollTop();
	$("#scrollBar").css("left", ($("body").innerWidth() - gearSize / 2) + "px");
	$("#scrollBar").css("top", Math.round(scrollBarButtonHeight + (window.innerHeight - scrollBarButtonHeight * 2) * (scrollPos + window.innerHeight / 2) / $("#content").height() - gearSize / 2) + "px");
	$("#gear").css("transform", "rotate(" + scrollPos * 0.1 + "deg)");
	
	if (!articlesDeployed && (scrollPos + window.innerHeight / 2 - $("#projects").offset().top >= articleDeployHeight)) {
		deployArticles();
	} else if (articlesDeployed && (scrollPos + window.innerHeight / 2 - $("#projects").offset().top < articleDeployHeight)) {
		retrieveArticles();
	}
	if (articlesDeployed) {
		focusedArticle = Math.round((scrollPos + window.innerHeight / 2 - $("#projects").offset().top - articleGap - articleHeight / 2) / (articleGap + articleHeight / 2 + cardHeight / 2));
		focusedArticle = Math.min(articles.length - 1, focusedArticle);
		focusedArticle = Math.max(0, focusedArticle);
	} else {
		focusedArticle = -1;
	}
}

function update() {	
	var deltaTime = Date.now() - currentTime;
	currentTime += deltaTime;
	
	if (autoScrolling) {
		$(window).scrollTop(autoScrollPos.value);
	}

	if (focusedArticle != expandingArticle) {
		expandingArticle = focusedArticle;
		expandTimer = 0;
	} else {
		expandTimer += deltaTime;
		if ((expandTimer >= expandDuration || !articlesDeployed) && expandingArticle != expandedArticle) {
			if (expandingArticle >= 0 && expandingArticle < articles.length) {
				expandArticle(expandingArticle);
			}
			if (expandedArticle >= 0 && expandedArticle < articles.length) {
				shrinkArticle(expandedArticle);
			}
			expandedArticle = expandingArticle;
		}
	}

	var windows = $(".window");
	var i, w, content, bg, pos;
	for (i = 0; i < windows.length; i++) {
		w = windows.eq(i);
		content = w.find(".far");
		bg = content.find(".bg");
		pos = - scrollPos / $("#content").height() * (bg.height() - window.innerHeight);
		content.css("top", pos + "px");
	}
	window.requestAnimationFrame(update);
}

function main() {
	var loading = $("#loading");
	loading.fadeIn(1000);
	loading.css("transform", "rotate(10800deg)")
	WebFont.load({
		google: {
		  families: ['Open Sans:400,700', 'Pacifico', 'Sansita']
		}
	});
	$("#gear").css("width", gearSize);
	$("#gear").css("height", gearSize);
	$("#imgView").click(hideImage);
	articles = $(".project");
	var i, alpha;
	for (i = 0; i < articles.length; i++) {
		articles.eq(i).append('<div class="projectWrapper"></div>');
		articles.eq(i).find(".projectWrapper").load(articles.eq(i).attr("data-address") + "content.html", articleLoadingComplete);
		articles.eq(i).css("top", cardGalleryPosY);
		articles.eq(i).css("transform", "rotate(10deg)");
		articles.eq(i).css("z-index", 99 - i);
		articles.eq(i).css("left", (50 + (i - (articles.length - 1.) / 2) * 75 / articles.length) + "%");
		articleImgLinePos[i] = 0;
	}
	$("#projects").height(2 * articleGap + articleHeight + (articles.length - 1) * (articleGap + cardHeight / 2 + articleHeight / 2));
	$("#mail").click(generate);
	
	
	resizing();
	scrolling();
	$(window).on('resize', function() {
		window.requestAnimationFrame(resizing);
	});
	$(window).on('scroll', function() {
		window.requestAnimationFrame(scrolling);
	});
	$("#first .bg").imagesLoaded(function() {
		$("#loading").stop().fadeOut(500, start);
	});
}

function start() {
	$("#line").css("width", "800px");
	$("#title").css("opacity", 1);
	$("#subtitle").css("opacity", 1);
	$("#first .bg").css("opacity", 1);
	$("#gear").css("opacity", 1);
	$("#wrapper").css("visibility", "visible");
	window.requestAnimationFrame(update);
}

function articleLoadingComplete() {
	articleLoaded++;
	if (articleLoaded == articles.length) {
		var i, j, front, imgs, imgWalls;
		$(".front").append('<img src="img/cardShadow.png" class="shadow">');
		$(".back").append('<img src="img/articleShadow.png" class="shadow">');
		$(".back").css("transform", "rotateY(180deg)  scale(" + cardWidth / articleWidth + "," + cardHeight / articleHeight + ")");
		imgWalls = $(".imgWall");
		imgWalls.append('<div class="imgLine"></div>');
		for (i = 0; i < articles.length; i++) {
			front = articles.eq(i).find(".front");
			front.on("mouseenter", i, highlightCard);
			front.on("mouseleave", i, unhighlightCard);
			front.on("mousedown", i, jumpToArticle);
			alpha = 1 - articleBackgroundImageAlpha;
			articles.eq(i).find(".back").css("background-image", "linear-gradient(rgba(255,255,255," + alpha + "), rgba(255,255,255," + alpha + ")), url(" + articles.eq(i).find(".thumbnail").prop("src") + ")");
			imgs = articles.eq(i).find(".imgWall img");
			for (j = 0; j < imgs.length; j++) {
				articles.eq(i).find(".imgLine").append(
					'<span class="imgContainer" style="background-image:url(' + imgs.eq(j).prop("src") + 
					')" data-src="' + imgs.eq(j).prop("src") + 
					'" data-description="' + imgs.eq(j).attr("data-description") + 
					'"></span>'
				);
			}
			imgs.remove();
			articleImgCount[i] = articles.eq(i).find(".imgLine .imgContainer").length;
		}
		imgWalls.append('<img src="img/shade.png" class="rightShade">');
		imgWalls.append('<img src="img/arrow.png" class="rightArrow">');
		imgWalls.append('<img src="img/shade.png" class="leftShade">');
		imgWalls.append('<img src="img/arrow.png" class="leftArrow">');
		for (i = 0; i < articles.length; i++) {
			articles.eq(i).find(".rightShade, .rightArrow").on("mousedown", i, scrollImgRight);
			articles.eq(i).find(".leftShade, .leftArrow").on("mousedown", i, scrollImgLeft);
		}
		$(".imgContainer").click(viewImage);
	}
}

function highlightCard(event) {
	if (!articlesDeployed) {
		var i, d;
		for (i = 0; i < articles.length; i++) {
			if (i == event.data) {
				articles.eq(i).find(".projectWrapper").css("transform", "translate(0, -30px) rotate(-7deg) scale(1.2)");
			} else {
				d = Math.round((i > event.data ? 100 : -100) * Math.pow(0.75, Math.abs(i - event.data) - 1));
				articles.eq(i).find(".projectWrapper").css("transform", "translate(" + d + "px, 0)");
			}
		}
	}
}

function unhighlightCard() {
	if (!articlesDeployed) {
		var i;
		for (i = 0; i < articles.length; i++) {
			articles.eq(i).find(".projectWrapper").css("transform", "");
		}
	}
}

function jumpToArticle(event) {
	autoScrolling = true;
	var targetPos = event.data * (articleGap + articleHeight / 2 + cardHeight / 2) + $("#projects").offset().top + articleGap - 10;
	autoScrollPos.value = scrollPos;
	$(autoScrollPos).animate({value: targetPos}, {duration: 1000, complete: function(){autoScrolling = false}});
}

function deployArticles() {
	unhighlightCard();
	articlesDeployed = true;
	for (i = 0; i < articles.length; i++) {
		articles.eq(i).css("transition", "top 750ms, left 500ms, transform 750ms");
		articles.eq(i).css("top", articleGap + articleHeight / 2 + i * (articleGap + articleHeight / 2 + cardHeight / 2) + "px");
		articles.eq(i).css("left", "50%");
		articles.eq(i).css("transform", "rotate(0deg)");
	}
}

function retrieveArticles() {
	articlesDeployed = false;
	for (i = 0; i < articles.length; i++) {
		articles.eq(i).css("transition", "top 250ms, left 500ms, transform 250ms");
		articles.eq(i).css("top", cardGalleryPosY);
		articles.eq(i).css("left", (50 + (i - (articles.length - 1.) / 2) * 75 / articles.length) + "%");
		articles.eq(i).css("transform", "rotate(10deg)");
	}
}

function expandArticle(index) {
	var front = articles.eq(index).find(".front");
	var back = articles.eq(index).find(".back");
	front.css("transform", "rotateY(180deg) scale(" + articleWidth / cardWidth + "," + articleHeight / cardHeight + ")");
	back.css("transform", "rotateY(360deg)");
}

function shrinkArticle(index) {
	var front = articles.eq(index).find(".front");
	var back = articles.eq(index).find(".back");
	front.css("transform", "rotateY(0deg)");
	back.css("transform", "rotateY(180deg)  scale(" + cardWidth / articleWidth + "," + cardHeight / articleHeight + ")");
}

function scrollImgLeft(event) {
	if (articleImgLinePos[event.data] > 0) {
		articleImgLinePos[event.data]--;
		var line = articles.eq(event.data).find(".imgLine");
		line.css("left", 110 - 260 * articleImgLinePos[event.data] + "px");
	}
}

function scrollImgRight(event) {
	if (articleImgLinePos[event.data] < articleImgCount[event.data] - 3) {
		articleImgLinePos[event.data]++;
		var line = articles.eq(event.data).find(".imgLine");
		line.css("left", 110 - 260 * articleImgLinePos[event.data] + "px");
	}
}

function viewImage(event) {
	var img = $("#imgView img");
	var figure = $("#imgView figure");
	var description = $("#imgView figcaption");
	var view = $("#imgView");
	
	img.prop("src", $(event.target).attr("data-src"));
	description.html($(event.target).attr("data-description"));
	var w = img.prop("naturalWidth");
	var h = img.prop("naturalHeight");
	var maxW = view.width() * 0.95;
	var maxH = view.height() * 0.95 - 50;
	if (w > maxW) {
		h *= maxW / w; w = maxW;
	}
	if (h > maxH) {
		w *= maxH / h; h = maxH;
	}
	figure.width(w);
	figure.height(h + 50);
	view.fadeIn(300);
}

function hideImage() {
	$("#imgView").fadeOut(300);
}

function generate() {
	$("#mail").css("opacity", 0);
	setTimeout(function() {
		$("#mail").css("visibility", "hidden");
		var text, text2, text3;
		text = "riusgown#q.os8igd*j2.sd(uiwh2f$si[[efg;w9k#2@ps.@gs";
		text2 = "p.o3ilg9%y^qzbts-odie9b.@rtch94%s*shs=sobmetnpw@8";
		text3 = "iaq;hu4,ce9s8r.gisu]e89%sp#dzp{0)eruf*gaw>";
		$("#generated").text(process(text)+process(text2)+process(text3));
		$("#generated").fadeIn(500);
	}, 500);
}

function process(str) {
	var i = 0;
	var s = 2;
	var res = "";
	while (i < str.length) {
		res += str.charAt(i);
		i += s; s++;
	}
	return res;
}

$(main);