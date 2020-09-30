<!DOCTYPE html>
<html>

<head>
	<title>Andy's homepage!!!!</title>
	<meta name="description" content="Homepage of a programmer!" />
	<!-- Place this tag in your head or just before your close body tag. -->
	<link rel='stylesheet' href='style.css' id='style' type='text/css'>
	<link rel='icon' href='_images/fish.png' id='icon' type='image/x-icon'>
	<script src='//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js'></script>
	<script src="headerGet.js"></script>
	<script>
		function toBlog(post){
			var title = document.getElementById(post).contentWindow.document.getElementById('title').innerHTML;
			var content = document.getElementById(post).contentWindow.document.getElementById('preview').innerHTML;
			var date = document.getElementById(post).contentWindow.document.getElementById('date').innerHTML;
			document.getElementById(post).src="";
			document.getElementById(post+"-div").innerHTML = '<p style=\"font-style: italic; color:grey;\">' + date + '</p><h2>' + title + '</h2><!--hr--><p>' + content + '</p><a href=\"readPost.php?post=' + title + '\" style=\"font-style: italic; color:grey;\">Read More</p><!--hr--><br>';
			document.getElementById("alert").innerHTML = "";
		}
	</script>

</head>

<body>
	<div id='headAndText'>
	</div>
	<div id="centerMenu">
	<div id="posts">
		<p id="alert">This blog is no longer active. Please visit <a href="http://quantonium.tk/blog-archive.php">quantonium.tk</a> for blog archive.</p>
		<?php
			$dir = 'posts/';
			$ffs = scandir($dir);
			$hiddenItems = array(".htaccess", ".htpasswd");
			$filez = '';
			 usort($ffs, function($a, $b){
        		return filectime('posts/'.$a) < filectime('posts/'.$b);
    		});
			foreach($ffs as $ff){
				if($ff != '.' && $ff != '..' && in_array($ff, $hiddenItems) == null){
					echo "<iframe id='".$ff."' src='posts/".$ff."' style='width:100%;height:100%;display:none;' onload='toBlog(\"".$ff."\");'>Your browser cannot retrieve blog posts.</iframe><div id='" . $ff . "-div'></div>";
					}
			}
		?>
		</div>
	</div>
	</body>
	</html>