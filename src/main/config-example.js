var $AppConfig = {
	"server" : {
        "host": "http://api.dev",
        "data": "/dataserver2/",
		"login": "/login/",
		"unsupported": "/login/unsupported.html"
    }
};

window.onerror = function(){
	//Just in case we don't get unregistered.
	if((NextThought || {}).isInitialized){
		return;	
	}
	window.location.replace($AppConfig.server.unsupported);
};
