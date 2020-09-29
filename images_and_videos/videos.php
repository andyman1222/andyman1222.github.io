<!DOCTYPE HTML>
<html>

<head>
    <meta charset="utf-8">
    <title>Videos!</title>
    <link rel="stylesheet" href="../style.css" id="style" type="text/css">
    <link rel="icon" href="../_images/fish.png" id="icon" type="image/x-icon">
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
    <script src="../headerGet.js"></script>

</head>

    <body>
    <div id='headAndText'>
    </div>
    <div id="overlay" style="visibility:hidden;position:fixed;top:0px;left:0px;width:100vw;height:100vh;">
        <div onClick="hideVid();" style="z-index:10;position:absolute;width:100vw;height:100vh;">
            <button style="right:20px;top:10px;position:absolute;" onClick="hideVid();">x</button>
            <video id="bigVideo" controls style="opacity:1;position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);width:80%;height:80%;"><source id="bigVideoSrc" type="video/mp4"></video>
        </div>
        <div style="background-color:black;opacity:.75;z-index:2;position:absolute;top:0px;left:0px;width:100%;height:100%;"></div>
    </div>
    <div id="centerMenu">
        <h1>ShadowPlay videos (BROKEN)</h1>
        <p>Due to a change in Google's API this site is at the moment broken. Please view these videos via the button below:</p>
        <button onClick="window.location.href='https://www.youtube.com/channel/UCprFjNl--OT7i-X2r1_pMiw/'">Click here to view ShadowPlay replays.</button>
        <!--
        <div id="btns1" style="visibility:hidden;" align="center"><button onClick="getPics(-53,-1)">Go to oldest videos</button><button onClick="next()" id="prevBtn1">Earlier dates</button><button onClick="previous()" id="nextBtn1">Later dates</button><button onClick="getPics(0,52)">Go to newest videos</button></div>
        <div id="status"></div>
        <div id="btns2" style="visibility:hidden;" align="center"><button onClick="getPics(-53,-1)">Go to oldest videos</button><button onClick="next()" id="prevBtn2">Earlier dates</button><button onClick="previous()" id="nextBtn2">Later dates</button><button onClick="getPics(0,52)">Go to newest videos</button></div>
        -->
        <script type="text/javascript">
            var xhttp2 = new XMLHttpRequest();
            var output2;
            var startNext, endNext;
            var startPrev, endPrev;
            var clickable = true;
            function update2(){
                xhttp2.onreadystatechange = function() {
                    if (xhttp2.readyState == 4 && xhttp2.status == 200) {
                        console.log("readystate = 4");
                        output2 = xhttp2.responseText;
                        //console.log(output2);
                        document.getElementById("status").innerHTML = output2;
                        
                        if(endPrev == -1){
                            document.getElementById("prevBtn1").visibility="hidden";
                            document.getElementById("prevBtn2").visibility="hidden";
                        }
                        else{
                            document.getElementById("prevBtn1").visibility="visible";
                            document.getElementById("prevBtn2").visibility="visible";
                        }
                        if(startNext == 0){
                            document.getElementById("nextBtn1").visibility="hidden";
                            document.getElementById("nextBtn2").visibility="hidden";
                        }
                        else{
                            document.getElementById("nextBtn1").visibility="visible";
                            document.getElementById("nextBtn2").visibility="visible";
                        }
                        document.getElementById("btns1").style.visibility = "visible";
                        document.getElementById("btns2").style.visibility = "visible" ;
                    }
                }
            }
            function getPics(start, end){
                endNext = end + 53;
                startNext = endNext - 52;
                startPrev = start - 53;
                endPrev = start - 1;
                
                document.getElementById("status").innerHTML = "<p>Retrieving videos, please wait...</p>";
                xhttp2.open("GET", window.location.protocol + "//" + window.location.host + "/images_and_videos/videosLoad.php?start=" + start + "&end=" + end ,true);
                xhttp2.send();
                update2();
                
            }
            function previous(){
                document.getElementById("btns1").style.visibility = "hidden";
                document.getElementById("btns2").style.visibility = "hidden";
                getPics(startPrev, endPrev);
            }

            function next(){
                document.getElementById("btns1").style.visibility = "hidden";
                document.getElementById("btns2").style.visibility = "hidden";
                getPics(startNext, endNext);
            }

            function displayVideo(source){
                if(clickable){
                    document.getElementById("overlay").style.visibility = "visible";
                    document.getElementById("bigVideoSrc").src=source;
                    document.getElementById("bigVideo").load();
                    document.getElementById("bigVideo").play();
                    clickable = false;
                }
            }

            function hideVid(){
                document.getElementById("overlay").style.visibility = "hidden";
                document.getElementById("bigVideo").pause();
                clickable = true;
            }

            getPics(0, 52);
        </script>

    </body>

</html>