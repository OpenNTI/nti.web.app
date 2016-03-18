var Ext = require('extjs');
var ToastManager = require('../common/toast/Manager');


/*globals Toaster*/
module.exports = exports = Ext.define('NextThought.util.Visibility', {

	mixins: {
		observable: 'Ext.util.Observable'
	},

	HIDDEN: null,
	VISIBILITY_STATE: null,
	VISIBILITY_EVENT: null,

	constructor: function(config) {
		this.callParent(arguments);

		this.mixins.observable.constructor.call(this, config);

		if (isFeature('no-analytic-end')) { return; }

		var timeouts = $AppConfig.activity_timeouts || {};

		this.BLUR_TIMEOUT = {
			warn: (timeouts.blur_warn || 0) * 1000,
			timeout: (timeouts.blur_timeout || 0) * 1000
		};

		this.INACTIVE_TIMEOUT = {
			warn: (timeouts.inactive_warn || 0) * 1000,
			timeout: (timeouts.inactive_timeout || 0) * 1000
		};

		this.initTimeoutFns();

		this.initVisibilityListeners();

		this.initActivityListeners();
	},

	initTimeoutFns: function() {
		var diff, warn, inactive,
			blurName = 'blur_timeout',
			inactiveName = 'inactive_timeout';

		this.__setInactive = this.__setInactive.bind(this);

		warn = this.BLUR_TIMEOUT.warn || 0;
		inactive = this.BLUR_TIMEOUT.timeout || 0;
		diff = inactive - warn;

		this.blurWarn = this.__warn.bind(this, blurName, diff, warn > 0);
		this.startBlurTimeout = this.__startTimeout.bind(this, blurName, warn, this.blurWarn);
		this.stopBlurTimeout = this.__stopTimeout.bind(this, blurName);


		warn = this.INACTIVE_TIMEOUT.warn || 0;
		inactive = this.INACTIVE_TIMEOUT.timeout || 0;
		diff = inactive - warn;

		this.inactiveWarn = this.__warn.bind(this, inactiveName, diff, warn > 0);
		this.startInactiveTimeout = this.__startTimeout.bind(this, inactiveName, warn, this.inactiveWarn);
		this.stopInactiveTimeout = this.__stopTimeout.bind(this, inactiveName);
	},

	initActivityListeners: function() {
		var me = this;

		function restartTimeout() {
			me.stopInactiveTimeout();
			me.startInactiveTimeout();

			if (me.is_inactive) {
				//prevent the next mouse move from setting
				//active again
				me.is_inactive = false;
				//bump this to the next event pump, so any event handlers
				//don't get called every mouse move
				wait().then(me.__setActive.bind(me));
			}
		}

		document.addEventListener('mousemove', restartTimeout, true);
		document.addEventListener('keypress', restartTimeout, true);
		document.addEventListener('scroll', restartTimeout, true);
	},

	initVisibilityListeners: function() {
		var me = this,
			browserPrefixes = ['moz', 'ms', 'o', 'webkit'];

		function checkPrefixes() {
			var i, hidden, prefix;

			for (i = 0; i < browserPrefixes.length; i++) {
				prefix = browserPrefixes[i];
				hidden = prefix + 'Hidden';

				if (hidden in document) {
					me.HIDDEN = hidden;
					me.VISIBILITY_STATE = prefix + 'VisibilityState';
					me.VISIBILITY_EVENT = prefix + 'visibilitychange';
				}
			}

			return me.HIDDEN;
		}

		//check for the unprefixed
		if ('hidden' in document) {
			me.HIDDEN = 'hidden';
			me.VISIBILITY_STATE = 'visibilityState';
			me.VISIBILITY_EVENT = 'visibilitychange';

			me.__setUpVisibilityListeners();
		//check for the prefixed
		} else if (checkPrefixes()) {
			me.__setUpVisibilityListeners();
		//fall back to the legacy
		} else {
			me.__setUpLegacyListeners();
		}
	},

	__setUpVisibilityListeners: function() {
		var me = this;

		document.addEventListener(this.VISIBILITY_EVENT, function() {
			var hidden = me.isHidden();

			if (hidden) {
				me.__onHide();
			} else {
				me.__onVisibile();
			}

			me.fireEvent('page-visibility-changed', !hidden);
		});
	},

	__setUpLegacyListeners: function() {
		var me = this,
			oldOnFocus = window.onfocus,
			oldOnBlur = window.onblur;

		window.onfocus = function() {
			me.is_legacy_hidden = false;

			me.__onVisibile();

			console.log('VISIBILITY: focus');

			if (oldOnFocus) {
				oldOnFocus.call(null);
			}

			me.fireEvent('page-visibility-changed', true);
		};


		window.onblur = function() {
			me.is_legacy_hidden = true;

			me.__onHide();

			console.log('VISIBILITY: blur');

			if (oldOnBlur) {
				oldOnBlur.call(null);
			}

			me.fireEvent('page-visibility-changed', false);
		};
	},

	__onHide: function() {
		this.startBlurTimeout();

		this.fireEvent('page-hidden');
	},

	__onVisibile: function() {
		this.stopBlurTimeout();

		if (this.is_inactive) {
			this.__setActive();
		}

		this.fireEvent('page-visible');
	},

	__setInactive: function() {
		console.log('VISIBILITY: inactive');

		this.is_inactive = true;

		if (this.locked_active) {
			console.log('VISIBILITY: locked active');
		} else {
			this.fireEvent('inactive');
		}
	},

	__setActive: function() {
		console.log('VISIBILITY: active');
		this.is_inactive = false;

		if (this.inactiveToast) {
			this.inactiveToast.close();
			this.inactiveToast = false;
		}

		this.fireEvent('active');
	},

	__warn: function(name, inactiveTime, showToast) {
		if (showToast && !this.inactiveToast) {
			this.inactiveToast = Toaster.makeToast({
				title: 'You\'ve been set inactive.',
				message: 'Due to inactivity for an extended period of time, you have been set inactive.'
			});
		}

		if (inactiveTime) {
			this[name] = setTimeout(this.__setInactive, inactiveTime);
		} else {
			this.__setInactive();
		}
	},

	__startTimeout: function(name, timeout, warnFn) {
		this[name] = setTimeout(warnFn, timeout);
	},

	__stopTimeout: function(name) {
		clearTimeout(this[name]);
	},

	lockActive: function() {
		this.locked_active = true;
	},

	unlockActive: function() {
		this.locked_active = false;
	},

	isInactive: function() {
		return this.is_inactive;
	},

	isHidden: function() {
		if (this.HIDDEN) {
			return document[this.HIDDEN];
		}

		return this.is_legacy_hidden;
	},

	getVisibilityState: function() {
		if (!this.VISIBILITY_STATE) { return 'visible'; }

		return document[this.VISIBILITY_STATE];
	}
}).create();
