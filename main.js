var scrollBarButtonHeight = 14;
var scrollPos = 0;
var smoothedPos = 0;
var focusedArticle = -1;
var previouslyFocusedArticle = -1;
var gearSize = 80;
var frameTime = 17;
var articles;
var cardHeight = 240;
var cardWidth = 200;
var cardGalleryPosY = -60;
var articleLoaded = 0;
var articleHeight = 1200;
var articleWidth = 1000;
var articleGap = 100;
var articleDeployHeight = 700;
var articlesDeployed = false;
var articleBackgroundImageAlpha = 0.05;
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
	
	if (!articlesDeployed && (scrollPos - window.innerHeight / 2 >= articleDeployHeight)) {
		deployArticles();
	} else if (articlesDeployed && (scrollPos - window.innerHeight / 2 < articleDeployHeight)) {
		retrieveArticles();
	}
	focusedArticle = Math.round((scrollPos + window.innerHeight / 2 - $("#projects").offset().top - articleGap - articleHeight / 2) / (articleGap + articleHeight / 2 + cardHeight / 2));
	if (focusedArticle != previouslyFocusedArticle) {
		if (focusedArticle >= 0 && focusedArticle < articles.length) {
			expandArticle(focusedArticle);
		}
		if (previouslyFocusedArticle >= 0 && previouslyFocusedArticle < articles.length) {
			shrinkArticle(previouslyFocusedArticle);
		}
		previouslyFocusedArticle = focusedArticle;
	}
}

function update() {
	smoothedPos = scrollPos;
	
	var windows = $(".window");
	var i, w, content, bg, pos;
	for (i = 0; i < windows.length; i++) {
		w = windows.eq(i);
		content = w.find(".far");
		bg = content.find(".bg");
		//pos = window.innerHeight + (smoothedPos + window.innerHeight - container.offset().top) / (window.innerHeight + container.height()) * ( - bg.height() - window.innerHeight);
		pos = - smoothedPos / $("#content").height() * (bg.height() - window.innerHeight);
		content.css("top", pos);
	}
}

function main() {
	$("#gear").css("width", gearSize);
	$("#gear").css("height", gearSize);
	articles = $(".project");
	var i, alpha;
	for (i = 0; i < articles.length; i++) {
		articles.eq(i).load(articles.eq(i).attr("data-address") + "content.html", articleLoadingComplete);
		articles.eq(i).css("top", cardGalleryPosY);
		articles.eq(i).css("transform", "rotate(10deg)");
		articles.eq(i).css("z-index", 100 - i);
		articles.eq(i).css("left", (50 + (i - (articles.length - 1.) / 2) * 75 / articles.length) + "%");
		articleImgLinePos[i] = 0;
	}
	$("#projects").height(2 * articleGap + articleHeight + (articles.length - 1) * (articleGap + cardHeight / 2 + articleHeight / 2));
	
	
	resizing();
	scrolling();
	$(window).resize(resizing);
	$(window).scroll(scrolling);
	setTimeout(start, 200);
}

function start() {
	$("#line").css("width", "800px");
	$("#title").css("opacity", 1);
	$("#subtitle").css("opacity", 1);
	$("#first .bg").css("opacity", 1);
	$("#gear").css("opacity", 1);
	$(".back").css("transform", "rotateY(180deg)  scale(" + cardWidth / articleWidth + "," + cardHeight / articleHeight + ")");
	$("#curtain").hide();
	setInterval(update, frameTime);
}

function articleLoadingComplete() {
	var i, j, imgs;
	articleLoaded++;
	if (articleLoaded == articles.length) {
		for (i = 0; i < articles.length; i++) {
			alpha = 1 - articleBackgroundImageAlpha;
			articles.eq(i).find(".back").css("background-image", "linear-gradient(rgba(255,255,255," + alpha + "), rgba(255,255,255," + alpha + ")), url(" + articles.eq(i).find(".thumbnail").prop("src") + ")");
			articles.eq(i).find(".front").append('<img src="img/cardShadow.png" class="shadow">');
			articles.eq(i).find(".imgWall").append('<div class="imgLine"></div>');
			imgs = articles.eq(i).find(".imgWall img");
			for (j = 0; j < imgs.length; j++) {
				articles.eq(i).find(".imgLine").append('<span class="imgContainer" style="background-image:url(' + imgs.eq(j).prop("src") + ')"></span>');
			}
			imgs.remove();
			articles.eq(i).find(".imgWall").append('<img src="img/shade.png" class="rightShade">');
			articles.eq(i).find(".imgWall").append('<img src="img/shade.png" class="leftShade">');
			articles.eq(i).find(".imgWall").append('<img src="img/arrow.png" class="rightArrow">');
			articles.eq(i).find(".imgWall").append('<img src="img/arrow.png" class="leftArrow">');
			articles.eq(i).find(".rightShade, .rightArrow").on("click", i, scrollImgRight);
			articles.eq(i).find(".leftShade, .leftArrow").on("click", i, scrollImgLeft);
			articleImgCount[i] = articles.eq(i).find(".imgLine .imgContainer").length;
		}
	}
}

function deployArticles() {
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

$(main);