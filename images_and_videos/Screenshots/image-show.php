<?php
$path=$_GET["path"];
$image = $_GET["image"];
$file = "../screenshots/" . $path . "/" . $image;
error_reporting(0);
?>
<!DOCTYPE HTML>
<html>
<head>
	<meta charset='utf-8'>
	<title><?php echo $image;?></title>
	<!-- Place this tag in your head or just before your close body tag. -->
<link rel='stylesheet' href='//quantumquantonium.ddns.net/style.css' id='style' type='text/css'>
  <link rel='icon' href='//quantumquantonium.ddns.net/_images/fish.png' id='icon' type='image/x-icon'>
  <script src='//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js'></script>
  <!-- Place this tag in your head or just before your close body tag. -->
  <script src='//apis.google.com/js/platform.js' async defer></script>
	<script src='//andyherbert254.ddns.net/headerGet.js'></script>
	<script src='//andyherbert254.ddns.net/google+badge.js'></script>


</head>

<body>
	<div id='headAndText'>
	</div>
<div id='centerMenu'>
<h1><?php echo $image;?></h1>
<button onClick='window.location.href="index.html"'>Go back to other screenshots</button><br>
<button onClick='window.location.href="epic"'>Go back to EPIC screenshots</button><br>
<div id = 'thumbnails' align = 'center'>
	<p>Click image to view in full size and download.</p>
	<a title='Click to view in full size and download.' href = <?php echo "'".$file."'";?>>
		<img style='width:100%;height:100%;' src=<?php echo "'".$file."'";?> alt=''>
	</a>
	<br>

</div>
</div>

<!-- Place this tag after the last widget tag. -->
<script type= 'text/javascript'>
  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = '//apis.google.com/js/platform.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();
</script>
</body>
</html>";
?>