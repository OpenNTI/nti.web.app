var $AppConfig = {
	"debug": false,
	"debugSocket": false,
	"debugSocketVerbosely": false,

	"features":{
		"rhp-groupchat": false,
		"chat-history": false,
		"presence-menu": true,
		"custom-status": false
	},
	"server" : {
        "host": "http://api.dev",
        "data": "/dataserver2/",
		"login": "/login/",
		"unsupported": "/login/unsupported.html"
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
if( window.top!==window ){
	window.top.location.href = location.href;
	//If the frame busting code is blocked, tell them embedding is not supported.
	location.replace('resources/iframe.html');
}
