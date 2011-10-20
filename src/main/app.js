document.write('<script	src="'+_AppConfig.server.host+'/socket.io/static/socket.io.js"></script>');

Ext.application({
    name: 'NextThought',
    appFolder: 'src/main/NextThought',

    controllers: [
        'Account',
        'Annotations',
        'Application',
        'Chat',
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
		var g = this.getController('Google');

		if(g.isHangout() && !g.isReady()){
			g.onHangoutReady(start);
		}
		else start();


		function start() {
		    NextThought.isDebug = true;

			applyHooks();
			removeLoaderSplash();

		    NextThought.controller.Session.login();
		}
	}
});
