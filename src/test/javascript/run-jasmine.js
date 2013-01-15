var page = require('webpage').create();
var server = require('webserver').create();
var fs = require('fs');
var s = fs.separator;
var host, port = 45670, path = phantom.libraryPath.split(s);
var i;
var verbose = false;
var mimeMap = {
	js: 'text/javascript',
	css: 'text/css',
	html: 'text/html',
	ico: 'image/ico',
	gif: 'image/gif',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	png: 'image/png'
};
// get CLI options
for (i = 0; i < phantom.args.length; i++) {
	if (phantom.args[i] === '--verbose') {
		verbose = true;
	}
}

// find index.html
while( !fs.exists(path.join(s)+s+'index.html') && path.length ){ path.pop(); }
if(!path.length){ console.log('index.html not found'); phantom.exit(); }
path = path.join(s);
fs.changeWorkingDirectory( path );

function mime(extention){
	return mimeMap[extention] || 'text/plain';
}

function serve (request, response) {
	var p = path+decodeURIComponent(request.url.split("?")[0]),
		e = fs.isFile(p),
		extention = p.split('.').pop();

	try {
		if(!e){
			response.statusCode = 404;
			console.log(p);
		}
		else{
			response.statusCode = 200;
			response.headers = {
				'Cache': 'no-cache',
				'Content-Type': mime(extention)
			};

			response.write(fs.read(p));
		}
	} catch(err) {
		response.statusCode = 500;
		console.log(p);
		console.log(JSON.stringify(err, null, 4));
	}
	response.close();
}

var listening = server.listen(port, serve);
if (!listening) {
	console.log("could not create web server listening on port " + port);
	phantom.exit();
}

// anonymous function to be immediately executed
(function(verbose){

	// waits for a certain condition to run some particular code
	function waitFor(testFx, onReady, timeOutMillis) {
		var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001,
			start = new Date().getTime(),
			condition = false,
			elapsedMillis = 0,
			interval = setInterval(function() {
				elapsedMillis = new Date().getTime() - start;
				if ( (elapsedMillis < maxtimeOutMillis) && !condition ) {
					condition = (testFx());
				} else {
					if(!condition) {
						console.log("'waitFor()' timeout");

						page.render('./out.png');

						phantom.exit(1);
					} else {
						onReady(elapsedMillis); // pass elapsed time to function
						clearInterval(interval);
					}
				}
			}, 100); //< repeat check every 100ms
	}

	// catch page alerts
	page.onAlert = function(msg){
		console.log('ALERT: '+msg);
	};

	// intercept console output
	page.onConsoleMessage = function(msg, line, source) {
		// TODO: associate miscellaneous console output with the test that generated it
	};

	// open the page and check for success
	page.open("http://localhost:"+port+"/index.html", function(status){
		// if the page failed to load, quit
		if (status !== "success") {
			console.log("Unable to access network\n\n"+JSON.stringify(status, null, 4));
			phantom.exit();
		}
		else {
			waitFor( // the whole page to load
				function(){
					return page.evaluate(function(){
						return !Boolean(document.body.querySelector('.pending'))
							&& Boolean(document.body.querySelector('.results'));
					});
				},

				function(elapsedMillis){
					var i, j;
					// stop intercepting console messages; print them again
					page.onConsoleMessage = function(msg, line, source) {
						console.log(msg);
					};
					// another anonymous immediate function
					page.evaluate( function(elapsedMillis, verbose) {
						// prints out the descriptions (and error messages, if any) of a list of specs
						function printTestResults(testsToPrint, verbose) {
							for (i = 0; i < testsToPrint.length; i++) {
								var testToPrint = testsToPrint[i];
								// print description
								var passOrFail = testToPrint.className.indexOf('passed') >= 0 ? 'PASSED' : 'FAILED';
								console.log(passOrFail + ': ' + testToPrint.getElementsByClassName('description')[0].innerHTML);
								var messages = testToPrint.querySelectorAll('.resultMessage, .stackTrace');
								// print error messages
								for (j = 0; j < messages.length; j++) {
									var message = messages[j];
									// always print result messages
									if (message.className.indexOf('resultMessage') >= 0) {
										console.log(message.innerHTML);
									}
									// print stack trace if --verbose is set
									if (verbose && message.className.indexOf('stackTrace') >= 0) {
										console.log('Stack trace:');
										console.log(message.innerHTML);
									} 
								}
								if (messages.length > 0) {
									console.log('');
								}
							}
						}
						// turn the elapsed millis into a nice string
						var elapsedSeconds = elapsedMillis / 1000;
						var elapsedMinutes = Math.floor(elapsedSeconds / 60);
						elapsedSeconds %= 60;
						var elapsedHours = Math.floor(elapsedMinutes / 60);
						elapsedMinutes %= 60;
						var elapsedTime = elapsedSeconds + ' seconds';
						if (elapsedMinutes > 0) {
							elapsedTime = elapsedMinutes + ' minutes ' + elapsedTime;
						}
						if (elapsedHours > 0) {
							elapsedTime = elapsedHours + ' hours ' + elapsedTime;
						}
												
						// count passed and failed tests
						var passed = document.body.querySelectorAll('.specSummary.passed').length;
						var failed = document.body.querySelectorAll('.specSummary.failed').length;

						// summary line
						console.log(failed + ' tests failed, ' + passed + ' tests passed in ' + elapsedTime);
						// print failed tests, if any
						if (failed > 0) {
							console.log('');
							printTestResults(document.body.querySelectorAll('.specDetail.failed'), verbose);
							if (verbose) {
								printTestResults(document.body.querySelectorAll('.suite.passed'), verbose);
							}
						}

					}, elapsedMillis, verbose); // pass these variables to the anonymous innermost function
					phantom.exit();
				},
				600001
			);
		}
	});
})(verbose); // pass these variables to the anonymous inner function
