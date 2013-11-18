(function() {

	var seenErrors = {}.
		XMLHttpFactories = [
		    function() {return new XMLHttpRequest();},
		    function() {return new ActiveXObject('Msxml2.XMLHTTP');},
		    function() {return new ActiveXObject('Msxml3.XMLHTTP');},
		    function() {return new ActiveXObject('Microsoft.XMLHTTP');}
		];

	function sendRequest(url, callback, postData) {
	    var req = createXMLHTTPObject(),
			method = postData ? 'POST' : 'GET';
	    if (!req) { return; }
	    req.open(method, url, true);
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

	function hook() {
		var onerror = window.onerror || function() {};
		window.onerror = function(msg, url, line) {
			var me = this, args = arguments, collectedLog = '[]', message, count;
			function escape(s) {
				return (s || '').toString().replace(/"/g, '\\"');
			}
			try {
				message = '{"message":"' + escape(msg) +
										'","file":"' + escape(url) +
										'","line":"' + escape(line);

				count = seenErrors[message] = (seenErrors[message] || 0) + 1;
				if (count > 1 && count % 100 !== 0) {
					return;
				}

				message += '","count":' + count;
				if (console.getCollected) {
					collectedLog = console.getCollected();
					message += ',"capturedLog":' + collectedLog;
				}

				message += '}';

				sendRequest(
						'/dataserver2/@@send-crash-report',
						function() {onerror.apply(me, args);},
						message
				);
			} catch (e) {
				onerror.apply(me, args);
			}
		};
	}

	hook();

	window.reportErrorEvent = hook;
}());
