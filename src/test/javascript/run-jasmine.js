/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
	var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timeout is 3s
		start = new Date().getTime(),
		condition = false,
		interval = setInterval(function() {
			if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
				// If not time-out yet and condition not yet fulfilled
				condition = (testFx()); //< defensive code
			} else {
				if(!condition) {
					// If condition still not fulfilled (timeout but condition is 'false')
					console.log("'waitFor()' timeout");
					phantom.exit(1);
				} else {
					// Condition fulfilled (timeout and/or condition is 'true')
					//console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
					onReady(); //< Do what it's supposed to do once the condition is fulfilled
					clearInterval(interval); //< Stop this interval
				}
			}
		}, 100); //< repeat check every 100ms
}

if (phantom.args.length === 0 || phantom.args.length > 2) {
	console.log('Usage: run-jasmine.js URL');
	phantom.exit();
}

var r={},page = typeof require!=='undefined'? require('webpage').create() : typeof WebPage!=='undefined' ? new WebPage() : null;

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

page.onResourceRequested = function(request){
//	console.log('required:\t'+request.url);
	r[request.url] = true;
};

page.onResourceReceived = function(request){
	delete r[request.url];
};


page.open(phantom.args[0], function(status){
	console.log('\nInitial Load finished, executing...\n');
	if (status !== "success") {
		console.log("Unable to access network");
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

				r = Object.keys(r);
				if(r.length>0)
					console.log("Unresolved resources: "+r.join('\n'));
				phantom.exit();
			},
			300001
		);
	}
});
