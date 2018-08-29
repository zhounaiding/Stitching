(function () {

    init();

    var imgFiles = new Array();
    var hasOutput = false;
    
    function init() {

        $("inputGroupFile02").addEventListener("change", showImages);
        $("upload-btn").addEventListener("click", uploadImages);
        
        validateSession();
    }

    function validateSession() {
        // The request parameters
        var url = './login';
        var req = JSON.stringify({});

        // make AJAX call
        ajax('GET', url, req,
            function(res) {
                var result = JSON.parse(res);
                if (result.status === 'OK') {
                    console.log(result);
                    onSessionValid(result.username);
                }
            });
    }
    
    function onSessionValid(username) {
    	$("nav-right").innerHTML = "";
    	
    	var welcomeItem = $("li", {
    		className: "nav-item"
    	});
    	var welcomeLink = $("a", {
    		className: "nav-link active",
    		href: "#"
    	});
    	welcomeLink.innerHTML = "Hi, " + username;
    	welcomeItem.appendChild(welcomeLink);
    	
    	var logoutItem = $("li", {
    		className: "nav-item"
    	})
    	var logoutLink = $("a", {
    		className: "nav-link",
    		href: "logout"
    	});
    	logoutLink.innerHTML = "logout";
    	logoutItem.appendChild(logoutLink);
    	
    	$("nav-right").appendChild(welcomeItem);
    	$("nav-right").appendChild(logoutItem);
    }
  

    // -----------------------------------
    // Choose and show images
    // -----------------------------------

    function showImages() {
    	if (hasOutput) {
    		$("preview").innerHTML = "";
    		imgFiles = new Array();
    	}
    	
        var files = $("inputGroupFile02").files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            imgFiles.push(file);
            if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
                var reader = new FileReader();

                reader.onload = (function(theFile) {
                    return function(e) {
                        var div = $("div", {
                            className : "col-3 images"
                        });
                        div.appendChild($("img", {
                            className : "img-thumbnail",
                            src : e.target.result,
                            alt : "screenshot"
                        }));
                        $("preview").appendChild(div);
                    };
                })(file);
                reader.readAsDataURL(file);
            }
        }
    }

    // -----------------------------------
    // Upload images and show result
    // -----------------------------------

    function uploadImages() {
        if(imgFiles.length < 2) {
            alert("Total images number must be larger than 1.");
            return;
        } 
        
        var formData = new FormData();
        for (var i = 0; i < imgFiles.length; i++) {
            formData.append("file", imgFiles[i]);
        }
        var url = './upload';

        ajax_blob('POST', url, formData, 
        function(res) {
            var blob = res;
            var img = document.createElement("img");
            img.onload = function(e) {
                window.URL.revokeObjectURL(img.src); 
            };
            img.src = window.URL.createObjectURL(blob);
            img.className = "img-thumbnail";
            
            var div = $("div", {
                className: "col-10 mx-auto"
            })
            div.appendChild(img);
            $("preview").innerHTML = "";
            $("preview").appendChild(div);
            
            hasOutput = true;
        },

        function() {
            alert('upload failed.');
        });
    }

    /**
     * A helper function that creates a DOM element <tag options...>
     * 
     * @param tag
     * @param options
     * @returns
     */
    function $(tag, options) {
        if (!options) {
            return document.getElementById(tag);
        }

        var element = document.createElement(tag);

        for (var option in options) {
            if (options.hasOwnProperty(option)) {
                element[option] = options[option];
            }
        }
        return element;
    }
    
    function hideElement(element) {
        element.style.display = 'none';
    }
    
    function showElement(element, style) {
        var displayStyle = style ? style : 'block';
        element.style.display = displayStyle;
    }

    /**
     * AJAX helper
     *
     * @param method -
     *            GET|POST|PUT|DELETE
     * @param url -
     *            API end point
     * @param callback -
     *            This the successful callback
     * @param errorHandler -
     *            This is the failed callback
     */
    function ajax(method, url, data, callback, errorHandler, credentials) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                callback(xhr.responseText);
            } else if (xhr.status === 401) {
            		console.log("verification failed");
            } else {
            		console.log("error in ajax");
            }
        };

        xhr.withCredentials = credentials;
        xhr.onerror = function() {
            console.error("The request couldn't be completed.");
        };

        if (data === null) {
            xhr.send();
        } else {
            xhr.setRequestHeader("Content-Type",
                "application/json;charset=utf-8");
            xhr.send(data);
        }
    }
    
    function ajax_blob(method, url, data, callback, errorHandler, credentials) {
    	var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.responseType = "blob";
        xhr.onload = function() {
            if (xhr.status === 200) {
                callback(xhr.response);
            } else {
                errorHandler();
            }
        };
        xhr.withCredentials = credentials;
        xhr.onerror = function() {
            console.error("The request couldn't be completed.");
            errorHandler();
        };

        if (data === null) {
            xhr.send();
        } else {
            xhr.processData = false;
            xhr.send(data);
        }
    }

})();