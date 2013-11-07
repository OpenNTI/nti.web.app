(function() {

	var XMLHttpFactories = [
		    function() {return new XMLHttpRequest();},
		    function() {return new ActiveXObject('Msxml2.XMLHTTP');},
		    function() {return new ActiveXObject('Msxml3.XMLHTTP');},
		    function() {return new ActiveXObject('Microsoft.XMLHTTP');}
		],
		onerror = window.onerror || function() {};

	function sendRequest(url, callback, postData) {
	    var req = createXMLHTTPObject(),
			method = postData ? 'POST' : 'GET';
	    if (!req) { return; }
	    req.open(method, url, true);
	    req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
	    if (postData) {
	        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}
	    req.onreadystatechange = function() {
	        if (req.readyState !== 4 || (req.status !== 200 && req.status !== 304)) { return; }
	        callback(req);
	    };

	    if (req.readyState === 4) { return; }
	    req.send(postData);
	}

	function createXMLHTTPObject() {
	    var i = 0;
	    for (i; i < XMLHttpFactories.length; i++) {
	        try { return XMLHttpFactories[i](); }
	        catch (e) { }
	    }
	    return null;
	}

	window.onerror = function(msg, url, line) {
		var me = this, args = arguments;
			sendRequest(
					'/reportCrash',
					function() {onerror.apply(me, args);},
					'm: ' + msg + '\nf: ' + url + '\nl: ' + line
			);
	};
}());
