var xhttp = new XMLHttpRequest();
var output;

function sendRequest() {
    xhttp.open("GET", "https://api.imgur.com/3/account/QuantumQuantonium/album/69Nh4", true);
    xhttp.setRequestHeader("Authorization", "Client-ID 12378c0b8eb812a");
    xhttp.send("");
    Catch();
}

function Catch() {
    xhttp.onreadystatechange = function (e) {
        if (xhttp.readyState == 4) {
            output = $.parseJSON('[' + xhttp.responseText + ']');
            output[0].data.images.forEach(function(element) {
                document.getElementById("photoList").innerHTML += "<img style='width:25%;height:25%;border-width:0px;padding:0px;cursor:pointer;' onClick= \"window.location.href='image-show.html?image=" + element.id + "'\" src='//i.imgur.com/" + element.id + "t.jpg' alt=''></img>";
            }, this);
        }
    }
}
sendRequest();