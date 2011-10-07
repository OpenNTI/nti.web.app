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
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 100ms
};

if (phantom.args.length === 0 || phantom.args.length > 2) {
    console.log('Usage: run-jasmine.js URL');
    phantom.exit();
}

var page = typeof require!='undefined'? require('webpage').create() : typeof WebPage!='undefined' ? new WebPage() : null;

if(page){
    // Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
    page.onConsoleMessage = function(msg) {
        console.log(msg);
    };

    page.open(phantom.args[0], function(status){
        if (status !== "success") {
            console.log("Unable to access network");
            phantom.exit();
        }
        else {
            waitFor(
                function(){//waiting for this to return true
                    return page.evaluate(function(){
                        return !!document.body.querySelector('.finished-at');
                    });
                },
                function(){
                    page.evaluate( function() {
                        console.log('Finished: '+document.body.querySelector('.description').innerText);
                        var list = document.body.querySelectorAll('div.jasmine_reporter > div.suite.failed');
                        for (i = 0; i < list.length; ++i) {
                            var el = list[i];
                            console.log('');
                            console.log(el.querySelector('.description').innerText+ " FAILED");

                            var specs = el.querySelectorAll('.spec.failed');
                            for (j = 0; j < specs.length; ++j) {
                                var spec = specs[j],
                                    trace = spec.querySelector('.stackTrace');
                                console.log('\t'+spec.querySelector('.description').innerText+ " FAILED");
                                console.log('\t-> Message: '+spec.querySelector('.resultMessage.fail').innerText);
                                console.log('\t-> Stack: '+(trace!=null ? trace.innerText : 'not supported by phantomJS yet'));
                            }
                        }
                    });
                    console.log('');
                    phantom.exit();
                },
                300001
            );
        }
    });
}
else {
    console.log('Could not create WebPage');
    phantom.exit();
}