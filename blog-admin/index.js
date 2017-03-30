var output;
var xhttp = new XMLHttpRequest;


function getInfo(){
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				console.log("readystate = 4");
				output = xhttp.responseText;
                document.getElementById("posts").innerHTML=output;
            }
      }
}

xhttp.open("GET", "getCurrentPosts.php");
xhttp.send();
getInfo();

function deletePost(post){
	if(confirm("Are you sure you want to delete post "+post+"?")){
		xhttp.open("GET", "deletePost.php?post=" + post);
		xhttp.send();
		location.reload();
	}
}