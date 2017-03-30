<!DOCTYPE HTML>
<html>

<head>
    <meta charset="utf-8">
    <title>Videos!</title>
    <link rel="stylesheet" href="//quantumquantonium.ddns.net/style.css" id="style" type="text/css">
    <link rel="icon" href="//quantumquantonium.ddns.net/_images/fish.png" id="icon" type="image/x-icon">
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
    <!-- Place this tag in your head or just before your close body tag. -->
    <script src="//apis.google.com/js/platform.js" async defer></script>
    <script src="//andyherbert254.ddns.net/headerGet.js"></script>
    <script src="//andyherbert254.ddns.net/google+badge.js"></script>

</head>

<body>
    <div id='headAndText'>
    </div>
    
    <div id="centerMenu">
        <h1>ShadowPlay videos</h1>
        <div id="status"><p>Retrieving videos, please wait...</p></div>
        <script type="text/javascript">
var xhttp2 = new XMLHttpRequest();
var output2;
function update2(){
    xhttp2.onreadystatechange = function() {
		if (xhttp2.readyState == 4 && xhttp2.status == 200) {
			console.log("readystate = 4");
			output2 = xhttp2.responseText;
            console.log(output2);
            document.getElementById("status").innerHTML = output2;
        }
    }
}
function getPics(){
    xhttp2.open("GET", window.location.protocol + "//" + window.location.host + "/images_and_videos/videosLoad.php" ,true);
	xhttp2.send();
    update2();
}

getPics();
</script>
    </div>
    <!--PAGE CONTENTS HERE-->


    </div>

</body>

</html>