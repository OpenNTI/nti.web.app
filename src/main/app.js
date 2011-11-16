document.write('<script	src="'+_AppConfig.server.host+'/socket.io/static/socket.io.js"></script>');

Ext.application({
    name: 'NextThought',
    appFolder: 'src/main/NextThought',

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
		var g = this.getController('Google');

		if(g.isHangout() && !g.isReady()){

			//the onApiReady thing seems to not work...so, brute-force for now.
			var i = setInterval(function(){
				if(g.isReady()){
					clearInterval(i);
					start();
				}
			},100);
		}
		else start();


		function start() {
			applyHooks();
			removeLoaderSplash();
		    NextThought.controller.Session.login();
			NextThought.isReady = true;
		}
	}
});
