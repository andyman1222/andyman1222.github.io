<?php
error_reporting(0);
$http_origin = $_SERVER['HTTP_ORIGIN'];
str_replace("://","%3A%2F%2F",$http_origin);
$useragent=$_SERVER['HTTP_USER_AGENT'];

$desktop = "<h1>AndyHerbert254/AndyMan1222</h1>
 <marquee><p>A completely custom-made webiste, with no ads!</p></marquee>
	<div id='headerButtons' style='display:block;float:center;' >
                <button onClick=\"window.location.href='//'+window.location.host+'/'\">home</button>
                <button onClick=\"window.location.href='//'+window.location.host+'/_javascript'\">Javascript home</button>
                <button onClick=\"window.location.href='//'+window.location.host+'/images_and_videos'\">Quantum Quantonium images/vids</button>
                <button onClick=\"window.location.href='//'+window.location.host+'/server_checker'\">Quantum Quantonium Servers</button>
                <button onClick=\"window.location.href='//'+window.location.host+'/sitemap'\">Complete sitemap</button>
                <br/>
                <br/>
                <br/>
	</div>
    <hr>";

if($_GET['mobile'] == 1){
echo $desktop;
}
else{
echo $desktop . "<div id='rightMenu'>
    <div style='border-width:5px;border-color:black;'>
        <h3 style='color:white;'>Google+ profile below</h3>
	    <!-- Place this tag where you want the widget to render. -->
        <iframe frameborder='0' hspace='0' marginheight='0' marginwidth='0' scrolling='no' style='position: static; top: 0px; width: 180px; margin: 5%; border-style: none; left: 0px; visibility: visible; height: 304px;' tabindex='0' vspace='0' width='100%' id='I0_1472084162553' name='I0_1472084162553' src='https://apis.google.com/u/0/_/widget/render/person?usegapi=1&amp;width=180&amp;href=%2F%2Fplus.google.com%2Fu%2F0%2F105606333806913064405&amp;theme=dark&amp;rel=author&amp;origin=http%3A%2F%2Fquantumquantonium.ddns.net&amp;gsrc=3p&amp;ic=1&amp;jsh=m%3B%2F_%2Fscs%2Fapps-static%2F_%2Fjs%2Fk%3Doz.gapi.en.k_vn0YRpRV0.O%2Fm%3D__features__%2Fam%3DAQ%2Frt%3Dj%2Fd%3D1%2Frs%3DAGLTcCMVmlaE45Ex3doQhOgdiTkbaf6Lng#_methods=onPlusOne%2C_ready%2C_close%2C_open%2C_resizeMe%2C_renderstart%2Concircled%2Cdrefresh%2Cerefresh%2Conload&amp;id=I0_1472084162553&amp;parent=" . $http_origin . "&amp;pfname=&amp;rpctoken=56361856' data-gapiattached='true' title='+Badge'><a href='//plus.google.com/u/0/105606333806913064405?prsrc=3'
   rel='publisher' target='_top' style='text-decoration:none;display:inline-block;color:white;text-align:center; font:13px/16px arial,sans-serif;white-space:nowrap;'>
<img src='//ssl.gstatic.com/images/icons/gplus-64.png' alt='' style='border:0;width:64px;height:64px;'/><br />
<span style='font-weight:bold;'>Andy Herbert</span><br /><span>on Google+</span>
</a></iframe>
    </div>
    </div>
    <div id='leftMenu'>
    <div style='border-width:5px;border-color:black;'>
        <h3 style='color:purple;'>Be sure to view my gaming website!</h3>
        <button onClick= \"window.location.href='//quantumquantonium.blogspot.com'\">quantumquantonium.blogspot.com</button>
        <hr>
        <h3>Source code for the website is now on GitHub!</h3>
        <button onClick=\"window.location.href='https://github.com/andyman1222/website-source-code'\">https://github.com/andyman1222/website-source-code</button>
    </div>
    </div>
        ";
}

?>