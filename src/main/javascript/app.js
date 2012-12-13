//disable script cache-busting _dc=... get string args
Ext.Loader.setConfig('disableCaching', false);
Ext.Loader.setPath('swfobject', 'resources/lib/swfobject.js');

Ext.application({
	name: 'NextThought',
	appFolder: 'javascript/NextThought',
	autoCreateViewport: false,

	requires: [
		'swfobject',
		'NextThought.util.Globals',
		'NextThought.model.anchorables.ContentPointer',
		'NextThought.model.anchorables.DomContentPointer',
		'NextThought.view.MessageBox' //Require this early so we have it if we need it
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
		'SlideDeck',
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
			location.replace($AppConfig.server.unsupported);
		}

		if(!Globals.validateConfig()){
			return;
		}

		//Uncomment to supress cross domain flash socket message
		//window.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;

		//if we get this far, we're good... no need to redirect to the unsupoprted page.
		delete window.onerror;
		window.onerror = null;

		if(Ext.isIE9 && !swfobject.hasFlashPlayerVersion("9.0.18")){
			alert('Flash is required for this application to function correctly in your browser.'
						+ Ext.DomHelper.markup([
				{tag:'br'},{tag:'br'},
				{tag: 'a', href: 'http://get.adobe.com/flashplayer/', html: 'Get it here.'}]));

			return;
		}

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

