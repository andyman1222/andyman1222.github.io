<?php
function listFolderFiles($dir){
    $ffs = scandir($dir);
    $hiddenItems = array(".htaccess", ".htpasswd","files");
    echo '<ul>';
     usort($ffs, function($a, $b){
        return filectime('../posts/'.$a) < filectime('../posts/'.$b);
    });
    foreach($ffs as $ff){
        if($ff != '.' && $ff != '..' && in_array($ff, $hiddenItems) == null){
            
            if(is_dir($dir.$ff."/")){
                echo "stuff";
            	listFolderFiles($dir.$ff."/");
            }
            else{
                echo "<br><div><div style='width:75%;display:inline-block;'><a href='//andyherbert254.ddns.net/blog-admin/editPost.php?post=" . $ff . "'>" . $ff . "</a></div><div style='display:inline-block;float:right;'><button onClick='deletePost(\"".$ff."\")'>Delete post</button></div></div><br><hr>";
            }
            echo '</li>';
        }
    }
    echo '</ul>';
}

listFolderFiles("../posts/");
?>