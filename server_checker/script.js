	var xhttp2 = new XMLHttpRequest();
	var output2;
	function run() {
		xhttp2.open("GET", window.location.protocol + "//" + window.location.host + "/server_checker/php-securer.php",true);
		xhttp2.send();
		xhttp2.onreadystatechange = function() {
			if (xhttp2.readyState == 4 && xhttp2.status == 200) {
				console.log("readystate = 4");
				console.log(xhttp2.responseText);
				output2 = xhttp2.responseText;
				if(output2.indexOf("srcds.exe")=="-1"){
					document.getElementById("TF2").innerHTML = "<p style='color:red;'>TF2 server is not running!</p>";
				}
				else{
					document.getElementById("TF2").innerHTML = "<p style='color:green;'>TF2 server is running!</p>";
				}
                if(output2.indexOf("BattlefrontII.exe")=="-1"){
					document.getElementById("battlefront").innerHTML = "<p style='color:red;'>Battlefront 2 server is not running!</p>";
				}
				else{
					document.getElementById("battlefront").innerHTML = "<p style='color:green;'>Battlefront 2 server is running!</p>";
				}
				if(output2.indexOf("httpd.exe")=="-1"){
					document.getElementById("web").innerHTML = "<p style='color:red;'>Web server is not running!</p>";
				}
				else{
					document.getElementById("web").innerHTML = "<p style='color:green;'>Web server is running!</p>";
				}
				if(output2.indexOf("Unturned.exe")=="-1"){
					document.getElementById("Unturned").innerHTML = "<p style='color:red;'>Unturned server is not running!</p>";
				}
				else{
					document.getElementById("Unturned").innerHTML = "<p style='color:green;'>Unturned server is running!</p>";
				}
				if(output2.indexOf("Java.exe")=="-1"){
					document.getElementById("Starmade").innerHTML = "<p style='color:red;'>Starmade server is not running!</p>";
				}
				else{
					document.getElementById("Starmade").innerHTML = "<p style='color:green;'>Starmade server is running!</p>";
				}
			}
		}
	}
run();