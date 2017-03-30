<!DOCTYPE HTML>
<html>

<head>
  <meta charset="utf-8">
  <title>document template</title>
  <link rel="stylesheet" href="//quantumquantonium.ddns.net/style.css" id="style" type="text/css">
  <link rel="icon" href="//quantumquantonium.ddns.net/_images/fish.png" id="icon" type="image/x-icon">
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
  <!-- Place this tag in your head or just before your close body tag. -->
  <script src="//apis.google.com/js/platform.js" async defer></script>
	<script src="//andyherbert254.ddns.net/headerGet.js"></script>
	<script src="//andyherbert254.ddns.net/google+badge.js"></script>
    <script>
    var xhttp = new XMLHttpRequest();
        function deleteFile(file){
	        if(confirm("Are you sure you want to delete file "+file+"?")){
		        xhttp.open("GET", "deleteFile.php?file=" + file);
		        xhttp.send();
		        location.reload();
	        }
        }
    </script>

</head>

<body>
	<div id='headAndText'>
	</div>
  <div id="centerMenu">
        <h1>Manage blog files</h1>
        <button onclick="window.location.replace('index.htm')">Back to posts</button>
        <?php
function listFolderFiles($dir){
    $ffs = scandir($dir);
    $hiddenItems = array(".htaccess", ".htpasswd");
    echo '<ul>';
     usort($ffs, function($a, $b){
        return filectime('../posts/files/'.$a) < filectime('../posts/files/'.$b);
    });
    foreach($ffs as $ff){
        if($ff != '.' && $ff != '..' && in_array($ff, $hiddenItems) == null){
            
            if(is_dir($dir.$ff."/")){
                echo "stuff";
            	listFolderFiles($dir.$ff."/");
            }
            else{
                echo "<br><div><div style='width:75%;display:inline-block;'><a href='//andyherbert254.ddns.net/posts/files/" . $ff . "'>" . $ff . "</a></div><div style='display:inline-block;float:right;'><button onClick='deleteFile(\"".$ff."\")'>Delete file</button></div></div><br><hr>";
            }
            echo '</li>';
        }
    }
    echo '</ul>';
}

listFolderFiles("../posts/files");
?>


  </div>

</body>

</html>