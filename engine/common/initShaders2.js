"use strict";

    // Get a file as a string using  AJAX
    function loadFileAJAX(name) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest(),
            okStatus = document.location.protocol === "file:" ? 0 : 200;
            xhr.open('GET', name);
            xhr.onload = () => {
                resolve(xhr.status == okStatus ? xhr.responseText : null);
            }
            xhr.onerror = () => {
                reject(xhr.status == okStatus ? xhr.responseText : null);
            }
            xhr.send(null);
            
        })
        
    }; 


    