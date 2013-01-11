var page = require('webpage').create();
var server = require('webserver').create();
var fs = require('fs');
var s = fs.separator;
var host, port = 45670, path = phantom.libraryPath.split(s);
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
	} catch(e) {
		response.statusCode = 500;
		console.log(p);
		console.log(JSON.stringify(e, null, 4));
	}
	response.close();
}


var listening = server.listen(port, serve);
if (!listening) {
	console.log("could not create web server listening on port " + port);
	phantom.exit();
}



(function(){

	function waitFor(testFx, onReady, timeOutMillis) {
		var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001,
			start = new Date().getTime(),
			condition = false,
			interval = setInterval(function() {
				if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
					condition = (testFx());
				} else {
					if(!condition) {
						console.log("'waitFor()' timeout");

						page.render('./out.png');

						phantom.exit(1);
					} else {
						onReady();
						clearInterval(interval);
					}
				}
			}, 100); //< repeat check every 100ms
	}


	page.onAlert = function(msg){
		console.log('ALERT: '+msg);
	};


	page.onConsoleMessage = function(msg, line, source) {
		// don't do anything
	};


	page.onLoadStarted = function(){
		// don't do anything
	};

	page.open("http://localhost:"+port+"/index.html", function(status){

		if (status !== "success") {
			console.log("Unable to access network\n\n"+JSON.stringify(status, null, 4));
			phantom.exit();
		}
		else {
			waitFor(
				function(){
					return page.evaluate(function(){
						return !Boolean(document.body.querySelector('.pending'))
							&& Boolean(document.body.querySelector('.results'));
					});
				},

				function(){
						page.onConsoleMessage = function(msg, line, source) {
							console.log(msg);
						};
						page.evaluate( function() {
						var start = new Date();
						var suites = document.body.querySelectorAll('.suite'),
							i, j, suite, suiteName, specName, passOrFail,
								specs, spec, passed, trace, runner, passedAll = true, suiteNameParent,
								suiteId, m, resultString = '', failedTests = [], numTests = 0, numPassed, numFailed;

						for (i = 0; i < suites.length; i++){
							suite = suites[i];

							suiteName = suite.querySelector('.description').innerText;
							suiteNameParent = suite.parentNode;
							while(suiteNameParent && suiteNameParent.className.indexOf("suite") >= 0){
								suiteName = suiteNameParent.querySelector('.description').innerText + " > " + suiteName;
								suiteNameParent = suiteNameParent.parentNode;
							}

							suiteId = 'suite-'+i;
							suite.setAttribute('id',suiteId);
							specs = suite.querySelectorAll('#'+suiteId+' > .specSummary');

							for (j = 0; j < specs.length; j++){
								spec = specs[j];
								passed = spec.className.indexOf('passed') != -1;
								specName = spec.querySelector('.description').innerText;

								numTests++;

								if(!passed){
									passedAll = false;
									failedTests.push(suiteName+': '+specName)
								}
							}
						}
						var end = new Date();
						var elapsedMillis = (end - start);
						var elapsedSeconds = elapsedMillis / 1000;
						var elapsedMinutes = Math.floor(elapsedSeconds / 60);
						elapsedSeconds %= 60;
						var elapsedHours = Math.floor(elapsedMinutes / 60);
						elapsedMinutes %- 60;
						var elapsedTime = elapsedSeconds + ' seconds';
						if (elapsedMinutes > 0) elapsedTime = elapsedMinutes + ' minutes ' + elapsedTime;
						if (elapsedHours > 0) elapsedTime = elapsedHours + ' hours ' + elapsedTime;
						
						numFailed = failedTests.length;
						numPassed = numTests - numFailed;

						console.log(numFailed + ' tests failed, ' + numPassed + ' tests passed in ' + elapsedTime)
						if (numFailed > 0) {
							console.log();
							console.log('Failed tests:');
							for (var i=0; i<failedTests.length; i++) {
								console.log(failedTests[i]);
							}
						}
					});
					phantom.exit();
				},
				600001
			);
		}
	});
})();
