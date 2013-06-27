var $AppConfig = {
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
    },
    "links":{
    	"childs_privacy": "https://docs.google.com/document/pub?id=1kNo6hwwKwWdhq7jzczAysUWhnsP9RfckIet11pWPW6k",
    	"terms_of_service": "https://docs.google.com/document/pub?id=1rM40we-bbPNvq8xivEKhkoLE7wmIETmO4kerCYmtISM&embedded=true"
    }
};

window.onerror = function(){
	//Just in case we don't get unregistered.
	if((window.NextThought || {}).isInitialized){
		return;	
	}
	window.location.replace($AppConfig.server.unsupported);
};
