//if(window.console && console.groupCollapsed){
//	console.groupCollapsed("Initialization");
//}

//disable script cache-busting _dc=... get string args
//Ext.Loader.setConfig('disableCaching', false);

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
		'Stream'
	],

	launch: function(){
		function start() {
			console.groupEnd();
			NextThought.controller.Session.login(app);
			NextThought.isReady = true;
		}

		$AppConfig.server.host = location.protocol + '//' + location.host;

		if(!Globals.validateConfig()){
			return;
		}
		Globals.loadScript($AppConfig.server.host+'/socket.io/static/socket.io.js');

		window.app = this;
		var g = this.getController('Google');


		if(g.isHangout()){
			g.onHangoutReady(start);
		}
		else {
			start();
		}
	}
});
