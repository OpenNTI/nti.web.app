Ext.application({
	name: 'NextThought',
	appFolder: 'src/main/NextThought',

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
			Globals.applyHooks();
			Globals.removeLoaderSplash();
			NextThought.controller.Session.login(app);
			NextThought.isReady = true;
		}

		Globals.loadScript(_AppConfig.server.host+'/socket.io/static/socket.io.js');
		Globals.loadScript(_AppConfig.server.host+'/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML', function(){
			Globals.loadScript('./resources/mathjaxconfig.js');
		});


		if(!HOST_PATTERN.test(_AppConfig.server.host)){
			console.error('Bad Server Config, your host does not validate the pattern:',HOST_PATTERN);
			return;
		}

		if(!/^\/.+\/$/.test(_AppConfig.server.data)){
			console.error('Bad Server Config, your data path does not validate the pattern: /.+/');
			return;
		}

		window.app = this;
		var g = this.getController('Google'),
			hostInfo = HOST_PATTERN.exec(_AppConfig.server.host);

		Ext.apply(_AppConfig.server,{
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
