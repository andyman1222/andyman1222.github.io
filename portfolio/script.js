function showDescription(parentId, textId, imageDiv) {
	document.getElementById(textId).style.display = 'block';
	document.getElementById(parentId).style.height = '100%';
	//document.getElementById(parentId).style.position='relative';
	document.getElementById(parentId).style.marginTop = '-10em';
	document.getElementById(parentId).style.paddingBottom = '0%';
	document.getElementById(imageDiv).style.filter = "blur(10px)";
	document.getElementById(imageDiv).style.webkitFilter = "blur(10px)";
}

function hideDescription(parentId, textId, imageDiv) {
	//return;
	document.getElementById(textId).style.display = 'none';
	document.getElementById(parentId).style.height = null;
	//document.getElementById(parentId).style.position='absolute';
	document.getElementById(parentId).style.marginTop = null;
	document.getElementById(parentId).style.paddingBottom = null;
	document.getElementById(imageDiv).style.filter = null;
	document.getElementById(imageDiv).style.webkitFilter = null;
}

var urlParams = new URLSearchParams(window.location.search);
var json;
$.getJSON("portfolioDocs.json").done(function(data) {json = data;});

function readFromFile(category){
	let t = document.getElementById("ports");
	t.innerHTML = "";
	
	if(json.hasOwnProperty(category)){
		t.innerHTML += ("<section id='" + category + "'><h2>" + category.name + "</h2><div id='portSection'>");
		let s = t.lastChild;
		//console.log(data[category]);
		for (j in data[category]) {
			let i = data[category][j];
			//console.log(i);
			s.innerHTML += (`<div class="port-item" onmouseover="showDescription('${j}D', '${j}', '${j}Img');"
				onmouseout="hideDescription('${j}D', '${j}', '${j}Img');"
				onclick="document.location.href= ${String(i.link).indexOf('http') == 0 ? '' : "document.location.origin + "} '${i.link}';">
				<div class="nice-background" id="${j}Img" style="background-image: url('${i.image}');">
				<img src="${i.image}" style="visibility: hidden;">
				</div>
				<div id="${j}D" class="nice-text">
				<h3 class="port-item">${j}</h3>
				<p id="${j}" style="display: none;" class="description">${i.desc}</p>
				</div>
				</div>`
			);
		}
		t.innerHTML += "</section>"
	}
}

function changePage(newPage){
	if(json.hasOwnProperty(newPage)){
		document.title = "Portfolio | " + json.newPage.name;
		document.getElementById("directory").style.display = "none";
		document.getElementById("small-directory").style.display = "initial";
		readFromFile(newPage);
	}
	else {
		document.getElementById("ports").innerHTML = "";
		document.getElementById("directory").style.display = "initial";
		document.getElementById("small-directory").style.display = "none";
		urlParams.delete("page");
		
	}
	if (history.pushState) {
		var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?page='+newPage;
		window.history.pushState({path:newurl},'',newurl);
	}
}
$(window).on('load', function() {
	if(urlParams.get("page") != ""){
		changePage(urlParams.get("page"));
	}
});

//readFromFile("portfolioDocs.json", "ports");