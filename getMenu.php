<!--?php
#obselete!
error_reporting(0);
$http_origin = $_SERVER['HTTP_ORIGIN'];
str_replace("://","%3A%2F%2F",$http_origin);
$useragent=$_SERVER['HTTP_USER_AGENT'];

$desktop = "<img title='Click me!' src='//quantonium.tk/_images/fish.png' style='width:5%;height:5%;' id='fishy' onmouseup='document.getElementById(\"fishy\").src = \"//quantonium.tk/_images/fish.png\"' onmousedown='document.getElementById(\"fishy\").src = \"//quantonium.tk/_images/fish-click.png\"'></img>
	<div id='headerButtons' style='display:block;float:center;' >
                <button onClick=\"window.location.href='//'+window.location.host+'/'\">home</button>
                <button onClick=\"window.location.href='//'+window.location.host+'/_javascript'\">Javascript home</button>
                <div id='dropdown'>
                    <button onClick=\"window.location.href='//'+window.location.host+'/images_and_videos'\">Quantum Quantonium images/vids</button>
                    <div id='dropdown-content'>
                        <button onClick=\"window.location.href='//'+window.location.host+'/images_and_videos'\">Quantum Quantonium images/vids</button>
                        <button onClick=\"window.location.href='//'+window.location.host+'/images_and_videos/imgur-viewer-epic.html'\">EPIC screenshots</button>
                        <button onClick=\"window.location.href='//'+window.location.host+'/images_and_videos/imgur-viewer-normal.html'\">other screenshots</button>
                        <button onClick=\"window.location.href='//'+window.location.host+'/images_and_videos/videos.php'\">ShadowPlay videos</button>
                    </div>
                </div>
                <button onClick=\"window.location.href='//'+window.location.host+'/sitemap'\">Complete sitemap</button>
                <br/>
	</div>
    <hr>";

if($_GET['mobile'] == 1){
echo $desktop;
}
else{
echo $desktop . "<div id='rightMenu'>
    <div style='border-width:5px;border-color:black;'>
        <h3 style='color:white;'>Profiles</h3>
        <button onClick=\"window.location.href='https://www.linkedin.com/in/andrew-herbert-7322a918a/'\">LinkedIn</button>
        <button onClick=\"window.location.href='https://www.facebook.com/andy.herbert.712'\">Facebook</button>
        <button onClick=\"window.location.href='https://rose-hulman.joinhandshake.com/users/21188963'\">Handshake</button>
        <button onClick=\"window.location.href='https://github.com/andyman1222'\">Github</button>
        <button onClick=\"window.location.href='https://gitlab.com/andyman1222'\">Gitlab</button>
        <hr>
        <h3 style='color: white;'>Portfolio</h3>
        <button onClick = \"window.location.href='https://mega.nz/#F!6P5zCAbY!beI2VH_5d82F68HmoM0_rQ'\">Opens in MEGA</button>
        <hr>Email: <br><a href='mailto:andycherbert@gmail.com'>andycherbert@gmail.com</a><br><a href='mailto:quantum@quantonium.tk'>quantum@quantonium.tk</a>
    </div>
    </div>
    <div id='leftMenu'>
    <div style='border-width:5px;border-color:black;'>
        <h3>Resume</h3>
        <button onClick=\"window.location.href='https://docs.google.com/document/d/1_wRBnFzdfDLHSJNXUON2aYLYCYj_4sF0SLTgUznnNxI/edit?usp=sharing'\">Opens in Google Docs</button>
        <hr><br><br>
        <h3 style='color:purple;'>Be sure to view my gaming website!</h3>
        <button onClick= \"window.location.href='//quantumquantonium.blogspot.com'\">quantumquantonium.blogspot.com</button>
        <h3 style='color:purple;'>And the corresponding Youtube channel:</h3>
        <button onClick=\"window.location.href='https://www.youtube.com/c/QuantumQuantonium'\">Youtube</button>
        <hr>
        <h3>And my non-gaming Youtube channel:</h3>
        <button onClick=\"window.location.href='https://www.youtube.com/channel/UCAX08ErePscAWnIK5_IZqHA'\">Also Youtube</button>
        <hr>
        
    </div>
    </div>
        ";
}

?-->