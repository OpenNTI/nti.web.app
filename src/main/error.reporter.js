/*globals ActiveXObject */
/*eslint no-var: 0, strict: 0, no-console: 0*/
(function () {
	'use strict';

	var seenErrors = {},
		XMLHttpFactories = [
			function () {return new XMLHttpRequest();},
			function () {return new ActiveXObject('Msxml2.XMLHTTP');},
			function () {return new ActiveXObject('Msxml3.XMLHTTP');},
			function () {return new ActiveXObject('Microsoft.XMLHTTP');}
		];

	function sendRequest (url, callback, postData) {
		var req = createXMLHTTPObject(),
			method = postData ? 'POST' : 'GET';
		if (!req) { return; }
		req.open(method, url, true);
		if (postData) {
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}
		req.onreadystatechange = function () {
			if (req.readyState !== 4 || (req.status !== 200 && req.status !== 304)) { return; }
			callback(req);
		};

		if (req.readyState === 4) { return; }
		req.send(postData);
	}

	function createXMLHTTPObject () {
		var i = 0;
		for (i; i < XMLHttpFactories.length; i++) {
			try { return XMLHttpFactories[i](); }
			catch (e) { /*empty*/ }
		}
		return null;
	}

	function hook () {
		var onerror = window.onerror || function () {};
		window.onerror = function (msg, url, line, column, errObj) {

			if (/^(SecurityError)/i.test(msg)) {
				return;
			}

			var me = this, args = arguments, message = '', data = {}, count;
			function escape (s) {
				return (s || '').toString().replace(/"/g, '\\"');
			}
			try {
				count = seenErrors[msg] = (seenErrors[msg] || 0) + 1;
				//this blocks events 2-99, 101-199, 201-299... probably should up the base count to see more repeated errors
				if (count > 1 && count % 100 !== 0) {
					return;
				}

				try {
					data = {
						message: msg,
						file: url,
						line: line,
						char: column,
						count: count,
						stacktrace: errObj && (errObj.stack || errObj)
					};

					if (console.getCollected) {
						data.collectedLog = console.getCollected();
					}

					message = JSON.stringify(data);
				} catch (e) {
					message = '{"message":"' + escape(msg) +
								'","file":"' + escape(url) +
								'","line":"' + escape(line) +
								'","char":"' + escape(column) +
								'","count":' + count +
								',"JSON": "Not defined"' +
							'}';
				}

				sendRequest(
					'/dataserver2/@@send-crash-report',
					function () {onerror.apply(me, args);},
					message
				);

			} catch (e2) {
				onerror.apply(me, args);
			}
		};
	}

	window.reportErrorEvent = hook;
}());
