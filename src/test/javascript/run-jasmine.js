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
console.log("Will run from: "+fs.workingDirectory);



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
		if(source)
			console.log(msg+"\t\t"+source+":"+line);
		else
			console.log(msg);
	};


	page.onLoadStarted = function(){
		console.log("Loading...");
	};

	page.open("http://localhost:"+port+"/index.html", function(status){

		console.log('\nInitial Load finished, executing...\n');

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
					console.log('\n\nEvaluating results:\n');

					page.evaluate( function() {
						var suites = document.body.querySelectorAll('.suite'),
							i, j, suite, suiteName, specName, passOrFail,
							specs, spec, passed, trace, runner, passedAll = true, suiteNameParent;

						for (i = 0; i < suites.length; i++){
							suite = suites[i];

							//if this suite contains suites then skip, we will flatten this list out
							if(suite.querySelector('.suite')){continue;}

							suiteName = suite.querySelector('.description').innerText;
							suiteNameParent = suite.parentNode;
							while(suiteNameParent && suiteNameParent.className.indexOf("suite") >= 0){
								suiteName = suiteNameParent.querySelector('.description').innerText + " > " + suiteName;
								suiteNameParent = suiteNameParent.parentNode;
							}

							passOrFail = suite.className.indexOf('passed') != -1 ? "Passed" : "Failed";
							console.log(passOrFail+':\t'+'Suite: '+suiteName);
							console.log('--------------------------------------------------------');
							specs = suite.querySelectorAll('.specSummary');
							for (j = 0; j < specs.length; j++){
								spec = specs[j];
								passed = spec.className.indexOf('passed') != -1;

								specName = spec.querySelector('.description').innerText;
								passOrFail = passed ? 'Passed' : "Failed";
								console.log('\t'+passOrFail+':\t'+specName);

								if(!passed){
									passedAll = false;
									console.log('\t\t-> Message: '+spec.querySelector('.resultMessage.fail').innerText);
									trace = spec.querySelector('.stackTrace');
									console.log('\t\t-> Stack: '+(trace!==null ? trace.innerText : 'not supported by phantomJS yet'));
								}
							}
							console.log('');
						}

						runner = document.body.querySelector('.alert');
						console.log('--------------------------------------------------------');
						console.log('Finished: '+runner.innerText);
						console.log('\nStatus: '+(passedAll? 'Good!':'There were failures!'));
					});
					console.log('\n');

					phantom.exit();
				},
				600001
			);
		}
	});
})();
