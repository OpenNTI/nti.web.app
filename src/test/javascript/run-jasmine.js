var r={},
	page;
	//port = 8084,
	//worker,
	//bb



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


//function ServerThread() {
//	var fs = require('fs'),
//		server = require('webserver').create(),
//		service, path,
//		s = fs.separator,
//		cache = {};
//
//	path = phantom.libraryPath.split(s);
//	while( !fs.exists(path.join(s)+s+'test.html') && path ){ path.pop(); }
//	if(!path){ console.log('test.html not found'); phantom.exit(); }
//
//	path = path.join(s);
//	fs.changeWorkingDirectory( path );
//	console.log("Serving from: "+fs.workingDirectory);
//
//	function mime(extention){
//
//		var map = {
//			js: 'text/javascript',
//			css: 'text/css',
//			html: 'text/html',
//			ico: 'image/ico',
//			gif: 'image/gif',
//			jpeg: 'image/jpeg',
//			jpg: 'image/jpeg',
//			png: 'image/png'
//		};
//
//		return map[extention] || 'text/plain';
//	}
//
//
//	function serve (request, response) {
//	//	console.log(JSON.stringify(request, null, 4));
//		var p = path+decodeURIComponent(request.url.split("?")[0]),
//			e = fs.isFile(p),
////			file,
//			extention = p.split('.').pop();
//
//		try {
//			if(!e){
//				response.statusCode = 404;
//				console.log(p);
//			}
//			else{
//				response.statusCode = 200;
//				response.headers = {
//					'Cache': 'no-cache',
//					'Content-Type': mime(extention)
//				};
//
//				if(!cache[p]){
//					cache[p] = fs.read(p);
//				}
//
//				response.write(cache[p]);
//			}
//		} catch(e) {
//			response.statusCode = 500;
//			console.log(p);
//			console.log(JSON.stringify(e, null, 4));
//		}
//	}
//
//
//	service = server.listen(port, serve);
//	if (!service) {
//		console.log('Error: Could not create web server listening on port ' + port);
//		phantom.exit();
//	}
//}
//
//
//Run server in a seporate thread...
//bb = new WebKitBlobBuilder();
//bb.append('(');
//bb.append(ServerThread.toString());
//bb.append(')();');
//worker = new Worker(webkitURL.createObjectURL(bb.getBlob()));
//console.log('Worker Created');
//worker.onerror = worker.onerror = function(e) { console.log("Error in file: "+JSON.stringify(e,null,4)); };
//worker.postMessage('');

//Or in this thread:
//ServerThread(); (causes tests to hang when they make XHRs)


page = require('webpage').create();
if(!page){
		console.log('Could not create WebPage');
		phantom.exit();
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


//page.open("http://localhost:"+port+"/test.html", function(status){
page.open(phantom.args[0], function(status){
	console.log('\nInitial Load finished, executing...\n');
	if (status !== "success") {
		console.log("Unable to access network\n\n"+JSON.stringify(status, null, 4));
		phantom.exit();
	}
	else {
		waitFor(
			function(){//waiting for this to return true
				return page.evaluate(function(){
					var runner = document.body.querySelector('.runner');
					if(!runner){ return !!runner; }
					return !!runner.querySelector('.description');
				});
			},
			function(){
				console.log('\n\nEvaluating results:\n');

				page.evaluate( function() {
					var suites = document.body.querySelectorAll('.suite'),
						i, j, suite, suiteName, specName, passOrFail,
						specs, spec, passed, trace, runner, passedAll = true;

					for (i = 0; i < suites.length; i++){
						suite = suites[i];

						suiteName = suite.querySelector('.description').innerText;
						passOrFail = suite.className.indexOf('passed') != -1 ? "Passed" : "Failed";
						console.log(passOrFail+':\t'+'Suite: '+suiteName);
						console.log('--------------------------------------------------------');
						specs = suite.querySelectorAll('.spec');
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

					runner = document.body.querySelector('.runner');
					console.log('--------------------------------------------------------');
					console.log('Finished: '+runner.querySelector('.description').innerText);
					console.log('\nStatus: '+(passedAll? 'Good!':'There were failures!'));
				});
				console.log('\n');

				phantom.exit();
			},
			600001
		);
	}
});
