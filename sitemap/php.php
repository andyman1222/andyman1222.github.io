<?php
function listFolderFiles($dir){
    $ffs = scandir($dir);
    $hiddenItems = array("userFiles" , ".htaccess", "Robotics", ".htpasswd", "screenshots", "videos" , "Screenshots", "config.dat", ".well-known",".git",".gitignore","posts",".vscode", "oauth2.php", "client_secret_850373061539-jill6m3e555ls2gvovbf8lk92ie0fvo2.apps.googleusercontent.com.json", "secret", "blog-admin");
    echo '<ul>';
    foreach($ffs as $ff){
        if($ff != '.' && $ff != '..' && in_array($ff, $hiddenItems) == null){
            
            if(is_dir($dir.$ff."/")){
                echo "<li><a href='" . $dir . $ff . "/" . "'>" . $ff . "</a>";
            	listFolderFiles($dir.$ff."/");
            }
            else{
                echo "<li><a href='" . $dir . $ff . "'>" . $ff . "</a>";
            }
            echo '</li>';
        }
    }
    echo '</ul>';
}

listFolderFiles("../");
?>