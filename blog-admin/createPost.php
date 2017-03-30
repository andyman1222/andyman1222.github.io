<html>
<head>
<link rel="stylesheet" href="//quantumquantonium.ddns.net/style.css" id="style" type="text/css">
  <link rel="icon" href="//quantumquantonium.ddns.net/_images/fish.png" id="icon" type="image/x-icon">
<?php
$title = urldecode($_GET['title']);
$preview = urldecode($_GET['preview']);
$postContent = urldecode($_GET['content']);
$day = urldecode($_GET['day']);
$month = urldecode($_GET['month']);
$year = urldecode($_GET['year']);
$file = fopen("../posts/".$title.".html",'w+');
fwrite($file,"<h3 id='title'>".$title."</h3>
<div id='preview'>".$preview."</div>
<div id='post'>".$postContent."</div>
<div id='date'>".$month."/".$day."/".$year."</div>
<div id='comments'></div>");
fclose($file);
echo "<script>window.location.href='index.htm';</script>";
?>
</head>
<body>
</body>
</html>
