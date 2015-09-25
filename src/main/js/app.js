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

import Application from './NextThought/controller/Application.js';

window.URL = window.URL || window.webkitURL;
window.Blob = window.Blob || window.webkitBlob;

Ext.USE_NATIVE_JSON = true;

//disable script cache-busting _dc=... get string args
Ext.Loader.setConfig('disableCaching', false); //for when unminified

Ext.application({
	name: 'NextThought',
	appProperty: 'appInstance',
	appFolder: '/app/js/NextThought',
	autoCreateViewport: false,

	requires: [
		'NextThought.util.Globals',
		'NextThought.overrides.*',
		'NextThought.util.Localization',//require this SUPER early.
		'NextThought.util.*'

		// 'Ext.grid.Panel',
		// 'Ext.grid.column.Date',
		// 'Ext.grid.plugin.CellEditing',

		// //Require this early so we have it if we need it
		// 'NextThought.view.MessageBar',
		// 'NextThought.view.MessageBox'
	],

	controllers: [
		'Application'
	],

	launch: function() {
		console.debug('launching');

		function start() {
			if (Ext.is.iOS) {
				Ext.getBody().addCls('x-ios');
			}

			Ext.applyIf($AppConfig, {links: {}});

			me.getController('Application').load(me);

			// me.getController('Session').login(me);
			NextThought.isReady = true;
		}

		var me = this, ios,
			reasons = [],
			unsupported = [], g,
			geckoRev = /rv:(\d+\.\d+)/.exec(Ext.userAgent) || [];

		Ext.each(//firefox doesn't report supporting: CSS3DTransform, so we'll omit it.
				['Canvas', 'Range', 'CSS3BoxShadow', 'CSS3BorderRadius'],
				function(f) {Boolean(!Ext.supports[f] && unsupported.push(f));});


		// allow PhantomJS through the browser block - at least far enough for our headless login test
		Ext.isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

		// allow capybara-webkit through in the same way
		Ext.isCapybaraWebkit = /capybara-webkit/i.test(navigator.userAgent);

		ios = (function() {
			if (/iP(hone|od|ad)/.test(navigator.platform)) {
				var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
				return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
			}
		}());


		if (unsupported.length > 0) {
			reasons.push('Required html5 features are not present: ' + unsupported.join(','));
		}

		if (!Ext.isIE && !Ext.isIE11p && !(Ext.isGecko && parseFloat(geckoRev[1]) > 23.9) && !Ext.isWebKit) {
			reasons.push('This version of FireFox is not supported.');
		}

		if (Ext.isIE9m) {
			reasons.push('Please use IE10 or newer');
		}

		if (Ext.isSafari && Ext.safariVersion < 6 && !Ext.isPhantomJS && !Ext.isCapybaraWebkit) {
			reasons.push('Please use the latest Safari available. Currently only 5.1+ is supported.');
		}

		if (ios && ios[0] < 6) {
			reasons.push('iOS 6 is the oldest iOS Safari we support.');
		}

		if (reasons.length > 0) {
			console.error(reasons.join('\n'));
			location.replace($AppConfig.server.unsupported);
			return;//we're leaving... so lets just stop here.
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

		start();
	}
});

//lets not show our dirty lawndry... urls sould be pretty with no "files" in them.
if (location.toString().indexOf('index.html') > 0) {
	location.replace(location.toString().replace('index.html', ''));
}