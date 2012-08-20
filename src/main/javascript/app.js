Ext.application({
	name: 'NextThought',
	appFolder: 'javascript/NextThought',
	autoCreateViewport: false,

	requires: [
		'NextThought.util.Globals',
		'NextThought.model.anchorables.ContentPointer',
		'NextThought.model.anchorables.DomContentPointer'
	],

	controllers: [
		'Account',
		'Annotations',
		'Application',
		'Assessment',
		'Chat',
		'Classroom',
		'FilterControl',
		'Google',
		'Groups',
		'Navigation',
		'Library',
		'Search',
		'Session',
		'State',
		'Stream'
	],

	launch: function(){
		function start() {
			NextThought.controller.Session.login(app);
			NextThought.isReady = true;
		}

		if(!Globals.validateConfig()){
			return;
		}
		Globals.loadScript(getURL('/socket.io/static/socket.io.js'));

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
