var $AppConfig = {
	"debug": false,
	"debugSocket": false,
	"debugSocketVerbosely": false,

	"enableSymbolicLinkingNav": true,

	"features":{
		"notepad":true
	},
	"server" : {
        "host": "",
        "data": "/dataserver2/",
		"login": "/login/",
		"unsupported": "/login/unsupported.html"
    },
    "Preferences":{
    	"webapp_kalturaPreferFlash": false
    }
};

window.onerror = function(){
	//Just in case we don't get unregistered.
	if((window.NextThought || {}).isInitialized){
		return;	
	}
	window.location.replace($AppConfig.server.unsupported);
};


//frame buster
//use weak comparison on purpose.
/*jslint eqeq:true */
if( top != window ){
	top.location.href = location.href;
	//If the frame busting code is blocked, tell them embedding is not supported.
	location.replace('resources/iframe.html');
}
