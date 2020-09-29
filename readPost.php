<!DOCTYPE HTML>
<html>

<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="style.css" id="style" type="text/css">
  <link rel="icon" href="_images/fish.png" id="icon" type="image/x-icon">
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
	<script src="headerGet.js"></script>
  <script>
		function output(){
			var title = document.getElementById("iframeContents").contentWindow.document.getElementById('title').innerHTML;
                        var preview = document.getElementById("iframeContents").contentWindow.document.getElementById('preview').innerHTML;
			var content = document.getElementById("iframeContents").contentWindow.document.getElementById('post').innerHTML;
			var date = document.getElementById("iframeContents").contentWindow.document.getElementById('date').innerHTML;
			//document.getElementById("iframeContents").src="";
                        document.title = title;
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
  <div id="centerMenu" style="overflow:hidden; height: 100vh;">

    <?php
        echo "<iframe id='iframeContents' src='posts/".$_GET['post'].".html' style='width:100%;height:100%;display:none;' onload='output();'>Your browser cannot retrieve blog posts.</iframe>";
    ?>
    <div style="padding:0% 10%; overflow:scroll; height: 90vh;">
    <h1 id="title"></h1>
    <p id="date" style="font-style: italic; color:grey;"></p>
    <br>
    <p id="preview"></p>
<br><br>
    <hr>
    <p id="content"></p><br><br><br><br>
  </div>
  </div>
  </div>

</body>

</html>