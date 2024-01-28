/**
HeaderGet.js handles code for website header functionality, as well as utilizing JQuery to insert header and sidebar content where appropriate.
There is a little easter egg with the header, defined in this document.
**/

var xhttpHead = new XMLHttpRequest();
var currentHeader;
var date = new Date();

//document.getElementById("stylesheet").href = "//"+window.location.host+"/style.css";
//document.getElementById("icon").href = "//"+window.location.host+"_images/fish.png";
//obselete
function applyHead() {
    xhttpHead.onreadystatechange = function () {
        if (xhttpHead.readyState == 4 && xhttpHead.status == 200) {
            console.log("readystate = 4");
            currentHeader = xhttpHead.responseText;
            document.getElementById("headAndText").innerHTML = currentHeader;
            document.getElementById("headAndText").style.width = "100%";
        }
    }
}
//obselete
function getHead() {
    xhttpHead.open("GET", window.location.protocol + "//" + window.location.host + "/getMenu.php?http-origin=" + window.location.protocol + "//" + window.location.host, true);
    xhttpHead.send();
    applyHead();
}

var iconList = ["circlular_blur.png", "cursedfish.png", "eue.png", "fish flipped.png", "fish mosaic.png", "fish.png", "fish-click.png", "fishvr.png", "fishwatery.png", "image0001.gif", "implode.png", "new icon v2.png", "piranha quantum.png", "piranha-resized - christmas.jpg"];

//getHead();
(function () {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = '//apis.google.com/js/platform.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    //console.log('this ran!');
})();

function randomFishImage(){
    return iconList[parseInt(Math.random()*iconList.length)];
}

function clickFish(){
    document.getElementById("fishy").src="//" + window.location.host + "/images/" + randomFishImage();
}

function unclickFish(){
    document.getElementById("fishy").src="//" + window.location.host + "/images/piranha-resized.jpg";
}

$(document).ready(function () {
    $("#headAndText").load("//" + window.location.host + "/header.html");
    if (date.getMonth() + 1 == 12 || date.getMonth() + 1 < 4) $.getScript("//" + window.location.host + "/snowstorm.js");
    
});

$(window).on('load', function(){
    preloadImages = [];
    for(i = 0; i < iconList.length; i++){
        preloadImages.push(new Image());
        preloadImages[i].src="//" + window.location.host + "/images/" + iconList[i];
    }
    setFav.setAttribute('href', "//" + window.location.host + "/images/" + randomFishImage());
})


var headTitle = document.querySelector('head');
var setFav = document.createElement('link');
setFav.setAttribute('rel', 'icon');
headTitle.appendChild(setFav);
