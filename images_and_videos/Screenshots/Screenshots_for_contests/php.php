<?php
error_reporting(0);
header("Content-Type: text/javascript; charset=utf-8");
try{
$http_origin = $_SERVER['HTTP_ORIGIN'];
}catch(Exception $e){
	$http_origin = "";
}

if ($http_origin == "http://quantumquantonium.blogspot.com" || $http_origin == "https://quantumquantonium.blogspot.com" )
{  
    header("Access-Control-Allow-Origin: $http_origin");
}
$directory = getcwd();
function scan($directory, $filename){
	$images = scandir($directory);
	$count = 0;
	foreach($images as $image)
	{
		if ((strpos($image, '.jpg') !== false)||(strpos($image, '.png') !== false)) {
			echo "<img style='width:50%;height:50%;border-width:0px;padding:0px;' onClick= \" window.location.href='//".$_SERVER['SERVER_NAME']."/images_and_videos/screenshots/screenshots_for_contests/image-show.php?image="  . $image . "&path=".$filename . "/'\" name=\"" . $image . "\" src=\"//quantumquantonium.ddns.net/images_and_videos/screenshots/screenshots_for_contests/" . $filename . "/" . $image . "\" alt='' id='image-" . $image . "'><div style='height:25%;width:100%;display:none;position:absolute;left:0;bottom:0;' id='imageDiv-" . $image . "'><p>" . $filename . "</p></div><script>\$('image-" . $image . "').hover(function () {\$('#imageDiv-" . $image . "').slideToggle('fast');});</script></img>";
		}
		else if($image.is_dir()){
			scan($directory . "/" . $image, $image);
		}
		$count = $count + 1;
	}
}

scan($directory, "");


?>