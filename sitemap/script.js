var xhttp2 = new XMLHttpRequest();
var output2;
function run() {
	xhttp2.open("GET", window.location.protocol + "//" + window.location.host + "/sitemap/php.php",true);
	xhttp2.send();
	xhttp2.onreadystatechange = function() {
		if (xhttp2.readyState == 4 && xhttp2.status == 200) {
			console.log("readystate = 4");
			console.log(xhttp2.responseText);
			output2 = xhttp2.responseText;
			document.getElementById("output").innerHTML = output2;
		}
	}
}

run();