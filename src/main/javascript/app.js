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
		'UserData',
		'Application',
		'Assessment',
		'Chat',
//		'Classroom',
		'FilterControl',
		'Google',
		'Groups',
		'Navigation',
		'Search',
		'Session',
		'State',
		'Stream'
	],

	launch: function(){
		function start() {
			me.getController('Session').login(app);
			NextThought.isReady = true;
		}

        var me = this,
			unsupported = [], g, geckoRev = /rv:(\d+\.\d+)/.exec(Ext.userAgent)||[];

		Ext.each(//firefox doesn't report supporting: CSS3DTransform, so we'll omit it.
				['Canvas','Range','CSS3BoxShadow','CSS3BorderRadius'],
			function(f){ Boolean(!Ext.supports[f] && unsupported.push(f)); });

		if(unsupported.length!==0 || (!Ext.isIE && !(Ext.isGecko && parseFloat(geckoRev[1]) > 4.9 ) && !Ext.isWebKit)){
			location.replace($AppConfig.server.login+'unsupported.html');
		}

		if(!Globals.validateConfig()){
			return;
		}

		//if we get this far, we're good... no need to redirect to the unsupoprted page.
		delete window.onerror;
		window.onerror = null;

		Globals.loadScript(getURL('/socket.io/static/socket.io.js'));

		window.app = me;
		g = me.getController('Google');


		if(g.isHangout()){
			g.onHangoutReady(start);
		}
		else {
			start();
		}
	}
});
