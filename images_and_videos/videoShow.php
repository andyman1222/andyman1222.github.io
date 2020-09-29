<!--?php
#Obselete!
    $id=$_GET["id"];
    $file = file_get_contents($id);
    //error_reporting(0);

    $xml = new SimpleXMLElement($file);
    $dom_sxe = dom_import_simplexml($xml);  // Returns a DomElement object

    $dom_output = new DOMDocument('1.0');
    $dom_output->formatOutput = true;
    $dom_sxe = $dom_output->importNode($dom_sxe, true);
    $dom_sxe = $dom_output->appendChild($dom_sxe);

    $xmlFormatted = (string)($dom_output->saveXML($dom_output, LIBXML_NOEMPTYTAG));
    $xmlObj = simplexml_load_string($xmlFormatted);
    
        $title = $xmlObj->children()->title;
?-->
<!DOCTYPE HTML>
<html>
<head>
	<meta charset='utf-8'>
	<title><?php echo $title;?></title>
	<link rel="stylesheet" href="../style.css" id="style" type="text/css">
  <link rel="icon" href="../_images/fish.png" id="icon" type="image/x-icon">
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
  <script src="../headerGet.js"></script>


</head>

<body>
	<div id='headAndText'>
	</div>
<div id='centerMenu'>
<h1><?php echo $title;?></h1>
<button onClick='window.location.href="videos.php"'>Go back to videos</button><br>
<div id = 'thumbnails' align = 'center'>
	<?php
        $currentItem = $xmlObj->children("media", true)->group;
        $dom_sxe = dom_import_simplexml($currentItem);  // Returns a DomElement object

        $dom_output = new DOMDocument('1.0');
        $dom_output->formatOutput = true;
        $dom_sxe = $dom_output->importNode($dom_sxe, true);
        $dom_sxe = $dom_output->appendChild($dom_sxe);

        $xmlFormatted = (string)($dom_output->saveXML($dom_output, LIBXML_NOEMPTYTAG));
        $xmlObj = simplexml_load_string($xmlFormatted);
        $item = $xmlObj->children("media", true)->content[sizeof($xmlObj->children("media", true)->content)-1];
        $content = explode("\"", $item->asXML());
        echo "<video width='100%' controls><source src=\"" . $content[1] . "\" type='video/mp4'></video>";
        ?>
	<br>

</div>
</div>
</body>
</html>