<!DOCTYPE HTML>
<html>

<head>
  <meta charset="utf-8">
  <title>Edit or create post</title>
  <link rel="stylesheet" href="//quantumquantonium.ddns.net/style.css" id="style" type="text/css">
  <link rel="icon" href="//quantumquantonium.ddns.net/_images/fish.png" id="icon" type="image/x-icon">
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
  <!-- Place this tag in your head or just before your close body tag. -->
  <script src="//apis.google.com/js/platform.js" async defer></script>
	<script src='//andyherbert254.ddns.net/headerGet.js'></script>
	<script src='//andyherbert254.ddns.net/google+badge.js'></script>
  <script>
  var output;
  function getPost(){
    document.getElementById("post-title").value=document.getElementById('postContent').contentWindow.document.getElementById('title').innerHTML;
    document.getElementById("post-preview").value=document.getElementById('postContent').contentWindow.document.getElementById('preview').innerHTML;
    document.getElementById("post-content").value=document.getElementById('postContent').contentWindow.document.getElementById('post').innerHTML;
  }
</script>
<script src="create.js"></script>

</head>

<body>
	<div id='headAndText'>
	</div>
  <div id="centerMenu">
    <h1>Edit post</h1>
    <br><br>
    <p>Title:<p>
    <input id="post-title" style="width:100%"></input>
    <p>Front page:</p>
    <textarea rows=5 id="post-preview" style="width:100%;"></textarea>
    <br><br><p>Content:</p><br>
    <textarea rows=10 id="post-content" style="width:100%;"></textarea>
    <?php
echo "<iframe onload = 'getPost()' id='postContent' src='../posts/".$_GET['post']."' style='display:none;'>Unable to retrieve requested post.</iframe>";
?>
<button onClick="createPost();">Save edits</button>
  </div>
</body>



</html>