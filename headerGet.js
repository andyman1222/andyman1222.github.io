var xhttpHead = new XMLHttpRequest();
var currentHeader;
var date = new Date();

//document.getElementById("stylesheet").href = "//"+window.location.host+"/style.css";
//document.getElementById("icon").href = "//"+window.location.host+"_images/fish.png";
//obselete
function applyHead(){
    xhttpHead.onreadystatechange = function() {
			if (xhttpHead.readyState == 4 && xhttpHead.status == 200) {
				console.log("readystate = 4");
				currentHeader = xhttpHead.responseText;
                document.getElementById("headAndText").innerHTML = currentHeader;
                document.getElementById("headAndText").style.width = "100%";
            }
    }
}
//obselete
function getHead(){
    xhttpHead.open("GET", window.location.protocol + "//" + window.location.host + "/getMenu.php?http-origin=" + window.location.protocol + "//" + window.location.host,true);
	xhttpHead.send();
    applyHead();
}

$(document).ready(function(){
    $("#headAndText").load("//" + window.location.host + "/header.html");
    if(date.getMonth()+1==12||date.getMonth()+1<4) $.getScript("//" + window.location.host + "/snowstorm.js");
    var headTitle = document.querySelector('head');
    var setFav = document.createElement('link');
    setFav.setAttribute('rel', 'icon');
    setFav.setAttribute('href', "//" + window.location.host + "/images/fish.png");
    headTitle.appendChild(setFav);
  });

//getHead();
(function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = '//apis.google.com/js/platform.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    //console.log('this ran!');
  })();