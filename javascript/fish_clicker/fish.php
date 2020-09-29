<?php
//get values from HTML
	//$document = new DomDocumet;
	//$document->validateOnParse = true;
	$IP = $_SERVER['SERVER_ADDR'];
	$PORT = $_GET['port'];
	$commands = $_GET['command'];
	$start = false;
	error_reporting(E_ALL);

	/* Get the port for the WWW service. */
	$service_port = getservbyname('www', 'tcp');

	/* Get the IP address for the target host. */
	$address = gethostbyname($IP);

	/* Create a TCP/IP socket. */
	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	if ($socket === false) {
	    echo "socket_create() failed: reason: " . socket_strerror(socket_last_error()) . "^";
	}
	
	if(($commands === "start")){
		
?>
