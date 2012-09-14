Ext.Loader.setConfig('enabled',true);
//disable script cache-busting _dc=... get string args
Ext.Loader.setConfig('disableCaching', false);

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
//		'Classroom',
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

		var unsupported = [], g;
		Ext.each(//firefox doesn't report supporting: CSS3DTransform, so we'll omit it.
				['Canvas','Range','CSS3BoxShadow','CSS3BorderRadius'],
			function(f){ Boolean(!Ext.supports[f] && unsupported.push(f)); });

		if(unsupported.length!==0 || Ext.isOpera){
			location.replace('notsupported.html');
		}

		if(!Globals.validateConfig()){
			return;
		}
		Globals.loadScript(getURL('/socket.io/static/socket.io.js'));

		window.app = this;
		g = this.getController('Google');


		if(g.isHangout()){
			g.onHangoutReady(start);
		}
		else {
			start();
		}
	}
});
