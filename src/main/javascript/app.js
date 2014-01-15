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
		window.disableCaching !== undefined ?
		window.disableCaching : false);

Ext.application({
	name: 'NextThought',
	appProperty: 'appInstance',
	appFolder: 'javascript/NextThought',
	autoCreateViewport: false,

	requires: [
		'NextThought.overrides.*',
		'NextThought.util.*',

		'Ext.grid.Panel',
		'Ext.grid.column.Date',
		'Ext.grid.plugin.CellEditing',

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
		'CourseWare',
		'FilterControl',
		'Forums',
		'Google',
		'Groups',
		'Navigation',
		'Profile',
		'Reader',
		'Search',
		'Session',
		'SlideDeck',
		'State',
		'Store',
		'Stream'
	],

	launch: function() {
		console.debug('launching');

		function start() {
			if (Ext.is.iOS) {
				Ext.getBody().addCls('x-ios');
			}

			Ext.applyIf($AppConfig, {links: {}});

			me.getController('Session').login(me);
			NextThought.isReady = true;
		}

		var me = this, ios, isIE11p,
			unsupported = [], g, geckoRev = /rv:(\d+\.\d+)/.exec(Ext.userAgent) || [];

		Ext.each(//firefox doesn't report supporting: CSS3DTransform, so we'll omit it.
				['Canvas', 'Range', 'CSS3BoxShadow', 'CSS3BorderRadius'],
				function(f) {Boolean(!Ext.supports[f] && unsupported.push(f));});

		function iOSversion() {
			if (/iP(hone|od|ad)/.test(navigator.platform)) {
				var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
				return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
			}
		}

		ios = iOSversion();

		Ext.isIE11p = isIE11p = !Ext.isIE && /Trident/i.test(navigator.userAgent);

		if (unsupported.length !== 0 ||
				(!Ext.isIE && !isIE11p && !(Ext.isGecko && parseFloat(geckoRev[1]) > 24) && !Ext.isWebKit) ||
				(Ext.isIE9m) ||
				(Ext.isSafari && Ext.safariVersion <= 6) ||
				(ios && ios[0] < 6)) {
			location.replace($AppConfig.server.unsupported);
		}

		if (!Globals.validateConfig()) {
			return;
		}

		//Uncomment to supress cross domain flash socket message
		//window.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;

		//if we get this far, we're good... no need to redirect to the unsupoprted page.
		delete window.onerror;
		window.onerror = null;
		window.reportErrorEvent();//keep the error reporter going.

		Globals.loadScript(getURL('/socket.io/static/socket.io.js'));

		g = me.getController('Google');


		if (g.isHangout()) {
			g.onHangoutReady(start);
		}
		else {
			start();
		}
	}
});

//lets not show our dirty lawndry... urls sould be pretty with no "files" in them.
if (location.toString().indexOf('index.html') > 0) {
	location.replace(location.toString().replace('index.html', ''));
}

if (location.search && history.replaceState) {
	//lets cleanup our search string too, shall we?
	history.replaceState(document.title, history.state, location.pathname);
}
