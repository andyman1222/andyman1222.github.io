<?php
error_reporting(0);
header("Content-Type: text/javascript; charset=utf-8");
try{
$http_origin = $_SERVER['HTTP_ORIGIN'];
}catch(Exception $e){
	$http_origin = "";
}


$path = $_GET['path'];

if ($http_origin == "http://quantumquantonium.blogspot.com" || $http_origin == "https://quantumquantonium.blogspot.com" )
{  
    header("Access-Control-Allow-Origin: $http_origin");
}
$directory = getcwd();
$images = scandir($directory . "/" . $path);
$count = 0;
exec (getcwd() . "/" . $path . "/changePerm.bat");
usort($images, function($a, $b){
    return filectime(getcwd() . "/" . $_GET['path']  . "/" . $a) < filectime(getcwd() . "/" . $_GET['path']  . "/" . $b);
});
foreach($images as $image)
{
	if ((strpos($image, '.jpg') !== false)||(strpos($image, '.png') !== false)) {
		
		echo "<img style='width:25%;height:25%;border-width:0px;padding:0px;' onClick= \" window.location.href='//".$_SERVER['SERVER_NAME']."/images_and_videos/screenshots/image-show.php?image=" . $image . "&path=".$path."'\" name=\"" . $image . "\" src=\"//quantumquantonium.ddns.net/images_and_videos/screenshots/" . $path . "/" . $image . "\" alt=''></img>";
	}
	$count = $count + 1;
}
?>