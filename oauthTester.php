<!DOCTYPE HTML>
<html>

<head>
  <meta charset="utf-8">
  <title>document template</title>
  <link rel="stylesheet" href="//quantumquantonium.ddns.net/style.css" id="style" type="text/css">
  <link rel="icon" href="//quantumquantonium.ddns.net/_images/fish.png" id="icon" type="image/x-icon">
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
  <script src="//andyherbert254.ddns.net/headerGet.js"></script>


</head>

<body>
  <div id='headAndText'>
  </div>
  <div id="centerMenu">
      <?php
        include("oauth2.php");
        $client = new GoogleHandler("https://picasaweb.google.com/data/", true, "https://quantonium.ddns.net/oauthTester.php");
        $client->authenticate();
        echo $client->getToken();
      ?>
  </div>
  <!--PAGE CONTENTS HERE-->


  </div>

</body>

</html>