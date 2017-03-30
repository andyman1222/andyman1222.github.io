<?php
$target_dir="../posts/files/";
$target_file = $target_dir . basename($_FILES["fileUpload"]["name"]);
$uploadOk = 1;
$imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);
if (file_exists($target_file)) {
    $uploadOk = 0;
}
else{
    move_uploaded_file($_FILES["fileUpload"]["tmp_name"], $target_file);
    echo $_FILES["fileUpload"]["name"];
}
?>