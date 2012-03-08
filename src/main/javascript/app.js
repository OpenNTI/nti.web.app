if(window.console && console.groupCollapsed){
	console.groupCollapsed("Initialization");
}

//disable script cache-busting _dc=... get string args if we're using the manifest

(function(){
	var cache,
		c = window.applicationCache;
	cache = Boolean(c && c.status);
	Ext.Loader.setConfig('disableCaching', !cache);
	console.log("Application is Caching: ",cache);
}());

Ext.application({
	name: 'NextThought',
	appFolder: 'assets/js/NextThought',

	requires: [
		'NextThought.util.StacktraceUtils',
		'NextThought.util.MD5',
		'NextThought.util.Globals'
	],

	controllers: [
		'Account',
		'Annotations',
		'Application',
		'Chat',
		'Classroom',
		'FilterControl',
		'Google',
		'Groups',
		'Home',
		'Modes',
		'ObjectExplorer',
		'Reader',
		'Search',
		'Session',
		'State',
		'Stream',
		'Whiteboard'
	],

	launch: function(){
		function start() {
			console.groupEnd();
			NextThought.controller.Session.login(app);
			NextThought.isReady = true;
		}

		if(typeof $AppConfig === 'undefined' || typeof $AppConfig.server === 'undefined'){
			alert("Bad or no configuation.");
			return;
		}

		if(typeof $AppConfig.server.login === 'undefined'){
			alert("Bad or no login configuation.");
			return;
		}

		if(!HOST_PATTERN.test($AppConfig.server.host)){
			alert('Bad Server Config, your host does not validate the pattern:'+HOST_PATTERN);
			return;
		}

		if(!/^\/.+\/$/.test($AppConfig.server.data)){
			alert('Bad Server Config, your data path does not validate the pattern: /.+/');
			return;
		}

		Globals.loadScript($AppConfig.server.host+'/socket.io/static/socket.io.js');

		window.app = this;
		var g = this.getController('Google'),
			hostInfo = HOST_PATTERN.exec($AppConfig.server.host);

		Ext.apply($AppConfig.server,{
			protocol: hostInfo[HOST_PATTERN_PROTOCOL_MATCH_GROUP],
			domain: hostInfo[HOST_PATTERN_DOMAIN_MATCH_GROUP],
			port: parseInt(hostInfo[HOST_PATTERN_PORT_MATCH_GROUP],10)
		});

		if(g.isHangout()){
			g.onHangoutReady(start);
		}
		else {
			start();
		}
	}
});
