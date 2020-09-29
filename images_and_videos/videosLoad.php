<!--?php
#Obselete!
header("Content-Type: text/javascript; charset=utf-8");
$http_origin = $_SERVER['HTTP_ORIGIN'];

if ($http_origin == "http://quantumquantonium.blogspot.com" || $http_origin == "https://quantumquantonium.blogspot.com" )
{  
    header("Access-Control-Allow-Origin: $http_origin");
}
    $file = file_get_contents("http://picasaweb.google.com/data/feed/api/user/brick1222.andycman/albumid/6131096177041228785");
    $xml = new SimpleXMLElement($file);
    $dom_sxe = dom_import_simplexml($xml);  // Returns a DomElement object

    $dom_output = new DOMDocument('1.0');
    $dom_output->formatOutput = true;
    $dom_sxe = $dom_output->importNode($dom_sxe, true);
    $dom_sxe = $dom_output->appendChild($dom_sxe);

    $xmlFormatted = (string)($dom_output->saveXML($dom_output, LIBXML_NOEMPTYTAG));
    $xmlObj = simplexml_load_string($xmlFormatted);
    $list = $xmlObj->children()->entry;
    $info = "";
    for($i = (sizeof($list)-$_GET['start']-1)%sizeof($list); $i > (sizeof($list)-$_GET['end']-1)%sizeof($list); $i--){
        $entry = $list[abs($i)];
        //echo $entry;
        $id = $entry->children()->id;
        $currentItem = $entry->children("media", true)->group;
        $dom_sxe = dom_import_simplexml($currentItem);  // Returns a DomElement object

        $dom_output = new DOMDocument('1.0');
        $dom_output->formatOutput = true;
        $dom_sxe = $dom_output->importNode($dom_sxe, true);
        $dom_sxe = $dom_output->appendChild($dom_sxe);

        $xmlFormatted = (string)($dom_output->saveXML($dom_output, LIBXML_NOEMPTYTAG));
        $xmlObj = simplexml_load_string($xmlFormatted);
        $item = $xmlObj->children("media", true)->content[1];
        echo $item;
        $content = explode("\"", $item->asXML());
        $item2 = $xmlObj->children("media", true)->content[sizeof($xmlObj->children("media", true)->content)-1];
        $largeVid = explode("\"", $item2->asXML())[1];
        echo "<video width='25%' loop muted onmouseover='clickable?document.getElementById(\"$id\").play():document.getElementById(\"$id\").pause()' onmouseout='document.getElementById(\"$id\").pause()' onClick= 'displayVideo(\"$largeVid\");'\" id=\"$id\"><source src=\"$content[1]\" type='video/mp4'></video>";
    }

?-->