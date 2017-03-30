<!DOCTYPE HTML>
<html>

<head>
  <meta charset="utf-8">
  <title>document template</title>
  <link rel="stylesheet" href="//quantumquantonium.ddns.net/style.css" id="style" type="text/css">
  <link rel="icon" href="//quantumquantonium.ddns.net/_images/fish.png" id="icon" type="image/x-icon">
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
  <!-- Place this tag in your head or just before your close body tag. -->
  <script src="//apis.google.com/js/platform.js" async defer></script>
	<script src="//andyherbert254.ddns.net/headerGet.js"></script>
	<script src="//andyherbert254.ddns.net/google+badge.js"></script>
  <script>
		function output(){
			var title = document.getElementById("iframeContents").contentWindow.document.getElementById('title').innerHTML;
      var preview = document.getElementById("iframeContents").contentWindow.document.getElementById('preview').innerHTML;
			var content = document.getElementById("iframeContents").contentWindow.document.getElementById('post').innerHTML;
			var date = document.getElementById("iframeContents").contentWindow.document.getElementById('date').innerHTML;
			//document.getElementById("iframeContents").src="";
      document.getElementById("title").innerHTML= title;
      document.getElementById("date").innerHTML= date;
      document.getElementById("preview").innerHTML= preview;
      document.getElementById("content").innerHTML= content;
		}
	</script>

</head>

<body>
	<div id='headAndText'>
	</div>
  <div id="centerMenu">

    <?php
        echo "<iframe id='iframeContents' src='posts/".$_GET['post'].".html' style='width:100%;height:100%;display:none;' onload='output();'>Your browser cannot retrieve blog posts.</iframe>";
    ?>
    <h1 id="title"></h1>
    <p id="date" style="font-style: italic; color:grey;"></p>
    <br>
    <p id="preview" style="font-style;"></p>
    <hr>
    <br>
    <p id="content"></p>
  </div>
  </div>

</body>

</html>