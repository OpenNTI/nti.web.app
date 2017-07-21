const Ext = require('extjs');
const logger = require('nti-util-logger').default.get('util:visibility');
const {wait} = require('nti-commons');

const Toaster = require('legacy/common/toast/Manager');
const {isFeature} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.util.Visibility', {

	mixins: {
		observable: 'Ext.util.Observable'
	},

	HIDDEN: null,
	VISIBILITY_STATE: null,
	VISIBILITY_EVENT: null,

	constructor: function (config) {
		this.callParent(arguments);

		this.mixins.observable.constructor.call(this, config);

		if (isFeature('no-analytic-end')) { return; }

		const timeouts = (global.$AppConfig || {}).activity_timeouts || {};

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

	initTimeoutFns: function () {
		let blurName = 'blur_timeout';
		let inactiveName = 'inactive_timeout';

		this.__setInactive = this.__setInactive.bind(this);

		let warn = this.BLUR_TIMEOUT.warn || 0;
		let inactive = this.BLUR_TIMEOUT.timeout || 0;
		let diff = inactive - warn;

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

	initActivityListeners: function () {
		const restartTimeout = () => {
			this.stopInactiveTimeout();
			this.startInactiveTimeout();

			if (this['is_inactive']) {
				//prevent the next mouse move from setting
				//active again
				this['is_inactive'] = false;
				//bump this to the next event pump, so any event handlers
				//don't get called every mouse move
				wait().then(x => this.__setActive(x));
			}
		};

		document.addEventListener('mousemove', restartTimeout, true);
		document.addEventListener('keypress', restartTimeout, true);
		document.addEventListener('scroll', restartTimeout, true);
	},

	initVisibilityListeners: function () {
		const browserPrefixes = ['moz', 'ms', 'o', 'webkit'];

		const checkPrefixes = () => {
			for (let i = 0; i < browserPrefixes.length; i++) {
				let prefix = browserPrefixes[i];
				let hidden = prefix + 'Hidden';

				if (hidden in document) {
					this.HIDDEN = hidden;
					this.VISIBILITY_STATE = prefix + 'VisibilityState';
					this.VISIBILITY_EVENT = prefix + 'visibilitychange';
				}
			}

			return this.HIDDEN;
		};

		//check for the unprefixed
		if ('hidden' in document) {
			this.HIDDEN = 'hidden';
			this.VISIBILITY_STATE = 'visibilityState';
			this.VISIBILITY_EVENT = 'visibilitychange';

			this.__setUpVisibilityListeners();
		//check for the prefixed
		} else if (checkPrefixes()) {
			this.__setUpVisibilityListeners();
		//fall back to the legacy
		} else {
			this.__setUpLegacyListeners();
		}
	},

	__setUpVisibilityListeners: function () {
		document.addEventListener(this.VISIBILITY_EVENT, () => {
			var hidden = this.isHidden();

			if (hidden) {
				this.__onHide();
			} else {
				this.__onVisibile();
			}

			this.fireEvent('page-visibility-changed', !hidden);
		});
	},

	__setUpLegacyListeners: function () {
		const {onfocus: oldOnFocus, onblur: oldOnBlur} = window;

		window.onfocus = () => {
			this['is_legacy_hidden'] = false;

			this.__onVisibile();

			logger.debug('VISIBILITY: focus');

			if (oldOnFocus) {
				oldOnFocus.call(null);
			}

			this.fireEvent('page-visibility-changed', true);
		};


		window.onblur = () => {
			this['is_legacy_hidden'] = true;

			this.__onHide();

			logger.debug('VISIBILITY: blur');

			if (oldOnBlur) {
				oldOnBlur.call(null);
			}

			this.fireEvent('page-visibility-changed', false);
		};
	},

	__onHide: function () {
		this.startBlurTimeout();

		this.fireEvent('page-hidden');
	},

	__onVisibile: function () {
		this.stopBlurTimeout();

		if (this['is_inactive']) {
			this.__setActive();
		}

		this.fireEvent('page-visible');
	},

	__setInactive: function () {
		logger.debug('VISIBILITY: inactive');

		this['is_inactive'] = true;

		if (this['locked_active']) {
			logger.debug('VISIBILITY: locked active');
		} else {
			this.fireEvent('inactive');
		}
	},

	__setActive: function () {
		logger.debug('VISIBILITY: active');
		this['is_inactive'] = false;

		if (this.inactiveToast) {
			this.inactiveToast.close();
			this.inactiveToast = false;
		}

		this.fireEvent('active');
	},

	__warn: function (name, inactiveTime, showToast) {
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

	__startTimeout: function (name, timeout, warnFn) {
		this[name] = setTimeout(warnFn, timeout);
	},

	__stopTimeout: function (name) {
		clearTimeout(this[name]);
	},

	lockActive: function () {
		this['locked_active'] = true;
	},

	unlockActive: function () {
		this['locked_active'] = false;
	},

	isInactive: function () {
		return this['is_inactive'];
	},

	isHidden: function () {
		if (this.HIDDEN) {
			return document[this.HIDDEN];
		}

		return this['is_legacy_hidden'];
	},

	getVisibilityState: function () {
		if (!this.VISIBILITY_STATE) { return 'visible'; }

		return document[this.VISIBILITY_STATE];
	}
}).create();
