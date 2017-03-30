<?php

header("Content-Type: text/javascript; charset=utf-8");
$http_origin = $_SERVER['HTTP_ORIGIN'];

if ($http_origin == "http://quantumquantonium.blogspot.com" || $http_origin == "https://quantumquantonium.blogspot.com" )
{  
    header("Access-Control-Allow-Origin: $http_origin");
}

error_reporting(E_ERROR);
exec ( "tasklist", $output);
foreach ($output as $value) {
	$programs = $programs . $value . "\n";
}
if(strpos($programs, "Unturned.exe") > 0){
	$send = $send . " Unturned.exe";
}
if(strpos($programs, "srcds.exe") > 0){
	$send = $send . " srcds.exe";
}
if(strpos($programs, "BattlefrontII.exe") > 0){
	$send = $send . " BattlefrontII.exe";
}
if(strpos($programs, "httpd.exe") > 0){
	$send = $send . " ews-httpd.exe";
}
if(strpos($programs, "java.exe") > 0){
	$send = $send . " Java.exe";
}
echo $send;
?>