<?php
    $file = file_get_contents("https://picasaweb.google.com/data/feed/api/user/116696308179792866362/albumid/6131096177041228785");
    $xml = new SimpleXMLElement($file);
    $dom_sxe = dom_import_simplexml($xml);  // Returns a DomElement object

    $dom_output = new DOMDocument('1.0');
    $dom_output->formatOutput = true;
    $dom_sxe = $dom_output->importNode($dom_sxe, true);
    $dom_sxe = $dom_output->appendChild($dom_sxe);

    $xmlFormatted = $dom_output->saveXML($dom_output, LIBXML_NOEMPTYTAG);
    $xmlObj = simplexml_load_string($xmlFormatted);
    foreach ($xmlObj->children() as $entry){
        $currentItem = (string)$entry->id;
        if($currentItem != ""){
            $file2 = file_get_contents($currentItem) or die("Cannot read " . $currentItem);
            $xml2 = new SimpleXMLElement($file2);
            $dom_sxe2 = dom_import_simplexml($xml2);  // Returns a DomElement object
            $dom_output2 = new DOMDocument('1.0');
            $dom_output2->formatOutput2 = true;
            $dom_sxe2 = $dom_output2->importNode($dom_sxe2, true);
            $dom_sxe2 = $dom_output2->appendChild($dom_sxe2);
            $xmlFormatted2 = $dom_output2->saveXML($dom_output2, LIBXML_NOEMPTYTAG);
            $xmlObj2 = simplexml_load_string($xmlFormatted2);
            echo "<video width='25%'><source src=\"" . (string)($xmlObj2->content) . "\" type='video/mp4'></video>";
            echo $xmlObj2->content;
        }
    }
?>
