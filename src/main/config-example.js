var $AppConfig = {
	"server" : {
        "host": "http://api.dev",
        "data": "/dataserver2/",
		"login": "/login/"
    }
};

window.onerror = function(){
	window.location.replace($AppConfig.server.login+'unsupported.html');
};
