const Ext = require('extjs');
Ext.Loader.setConfig({enabled: false});

const {getURL, validateConfig, loadScript} = require('./util/Globals');

require('./util/Localization');
require('./overrides');
require('./controller/Application');

// DO NOT DELETE - this directive is required for Sencha Cmd packages to work.
//@require @packageOverrides

window.URL = window.URL || window.webkitURL;
window.Blob = window.Blob || window.webkitBlob;

Ext.USE_NATIVE_JSON = true;


Ext.application({
	name: 'NextThought',
	appProperty: 'appInstance',
	autoCreateViewport: false,


	controllers: [
		'Application'
	],

	launch () {
		console.debug('launching');
		let me = this;
		let ios;
		let reasons = [];
		let unsupported = [];
		let geckoRev = /rv:(\d+\.\d+)/.exec(Ext.userAgent) || [];

		function start () {
			if (Ext.is.iOS) {
				Ext.getBody().addCls('x-ios');
			}

			Ext.applyIf($AppConfig, {links: {}});

			me.getController('Application').load(me);

			// me.getController('Session').login(me);
			NextThought.isReady = true;
		}



		//firefox doesn't report supporting: CSS3DTransform, so we'll omit it.
		for(let f of ['Canvas', 'Range', 'CSS3BoxShadow', 'CSS3BorderRadius']) {
			if(!Ext.supports[f]) { unsupported.push(f); }
		}


		// allow PhantomJS through the browser block - at least far enough for our headless login test
		Ext.isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

		// allow capybara-webkit through in the same way
		Ext.isCapybaraWebkit = /capybara-webkit/i.test(navigator.userAgent);

		ios = (function () {
			if (/iP(hone|od|ad)/.test(navigator.platform)) {
				let v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
				return v && [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
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
			window.location.replace($AppConfig.unsupported);
			return;//we're leaving... so lets just stop here.
		}

		if (!validateConfig()) {
			return;
		}

		//Uncomment to supress cross domain flash socket message
		//window.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;

		//if we get this far, we're good... no need to redirect to the unsupoprted page.
		//Clear out the old onerror if there is one and register our own.
		//Note: In chrome and firefox if you delete window.onerror and then reset
		//it the old onerror function gets called when an error occurs (bizarre)
		//That is why we just null it out here rather than deleting it.
		//delete window.onerror;
		window.onerror = null;
		window.reportErrorEvent();//keep the error reporter going.

		loadScript(getURL('/socket.io/static/socket.io.js'));

		start();
	}
});

//lets not show our dirty lawndry... urls sould be pretty with no "files" in them.
if (window.location.toString().indexOf('index.html') > 0) {
	window.location.replace(window.location.toString().replace('index.html', ''));
}
