var date = new Date;
var month = date.getMonth()+1;
var xhttp = new XMLHttpRequest();
var data;
var formData = new FormData();

function createPost(){
window.location.href="createPost.php?title="+encodeURIComponent(document.getElementById("post-title").value)+"&preview="+encodeURIComponent(document.getElementById("post-preview").value)+"&content="+encodeURIComponent(document.getElementById("post-content").value)+"&day="+date.getDate()+"&month="+month+"&year="+date.getFullYear();
}

function insertAtCursor(myField, myValue) {
    //IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
    } else {
        myField.value += myValue;
    }
}

function getInfo(){
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				console.log("readystate = 4");
				output = xhttp.responseText;
                document.getElementById("output").innerHTML=document.getElementById("output").innerHTML + "<p>" + output + "</p>";
            }
      }
}


function uploadFile(file){
    formData.append("fileUpload", file); 
    xhttp.open("POST", "upload.php");
    xhttp.send(formData);
    getInfo();
}

function allowDrop(ev){
    ev.preventDefault();
}

function drop(field, ev) {
    formData = new FormData();
    ev.preventDefault();
    if(ev.dataTransfer.files.length!=0){
        data = ev.dataTransfer.files;
        for(var i = 0; i < data.length; i++){
            if(data[i].name.indexOf(".jpg")!=-1||data[i].name.indexOf(".png")!=-1||data[i].name.indexOf(".gif")!=-1||data[i].name.indexOf(".jpeg")!=-1){
                insertAtCursor(field, "<img src='posts/files/" + data[i].name + "'></img>");
            }
            else{
                insertAtCursor(field, "<a href='posts/files/" + data[i].name + "'>" + data[i].name + "</a>");
            }
            uploadFile(data[i]);
        }
    }
    else{
        data = ev.dataTransfer.getData("text");
        insertAtCursor(field, data);
    }
}