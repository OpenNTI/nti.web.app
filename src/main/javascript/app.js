/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when it performs code generation tasks such as generating new
    models, controllers or views and when running "sencha app upgrade".

    Ideally changes to this file would be limited and most work would be done
    in other places (such as Controllers). If Sencha Cmd cannot merge your
    changes and its generated code, it will produce a "merge conflict" that you
    will need to resolve manually.
*/

// DO NOT DELETE - this directive is required for Sencha Cmd packages to work.
//@require @packageOverrides


//disable script cache-busting _dc=... get string args
Ext.Loader.setConfig('disableCaching',
		window.disableCaching !== undefined
				? window.disableCaching
				: false );

Ext.application({
	name: 'NextThought',
	appFolder: 'javascript/NextThought',
	autoCreateViewport: false,

	requires: [
		'NextThought.overrides.*',
		'NextThought.util.*',

		//Require this early so we have it if we need it
		'NextThought.view.MessageBar',
		'NextThought.view.MessageBox'
	],

	controllers: [
		'Account',
		'UserData',
		'Application',
		'Assessment',
		'Chat',
		'FilterControl',
		'Forums',
		'Google',
		'Groups',
		'Navigation',
		'Profile',
		'Search',
		'Session',
		'SlideDeck',
		'State',
		'Store',
		'Stream'
	],

	launch: function(){
		console.debug('launching');

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

		if(Ext.isSafari && Ext.safariVersion <= 6){
			Ext.getBody().addCls('disable-animations');
		}

		if(!Globals.validateConfig()){
			return;
		}

		//Uncomment to supress cross domain flash socket message
		//window.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;

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

