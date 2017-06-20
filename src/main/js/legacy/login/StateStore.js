const Ext = require('extjs');
const UserRepository = require('legacy/cache/UserRepository');
const Socket = require('legacy/proxy/Socket');
const ObjectUtils = require('legacy/util/Object');
require('legacy/common/StateStore');
const ModelService = require('legacy/model/Service');
const PreferenceManager = require('legacy/preference/Manager');

const lazy = require('legacy/util/lazy-require')
				.get('AccountActions', ()=> require('legacy/app/account/Actions'));

// const AccountActions = require('legacy/app/account/Actions');

const {wait} = require('nti-commons');
const {TemporaryStorage} = require('legacy/cache/AbstractStorage');

module.exports = exports = Ext.define('NextThought.login.StateStore', {
	extend: 'NextThought.common.StateStore',
	sessionTrackerKey: 'sidt',
	actions: {},

	constructor: function () {
		this.callParent(arguments);

		this.onLoginActions = [];
		this.loginActionsNames = {};

		//Make sure the session is still valid when the window is focused
		this.mon(Ext.get(window), {
			focus: '__validateSession'
		});
	},

	registerLoginAction: function (fn, name) {
		if (name && !this.loginActionsNames[name]) {
			this.onLoginActions.push(fn);
			this.loginActionsNames[name] = true;
		} else if (!name) {
			this.onLoginActions.push(fn);
		}
	},

	setupSocket: function () {
		Socket.setup();
	},

	__validateSession: function () {
		console.log('Validating Session');

		var v = this.sessionStarted && TemporaryStorage.get(this.sessionTrackerKey);

		if (v !== this.sessionId && this.sessionStarted) {
			Socket.tearDownSocket();

			alert({
				title: 'Alert',
				msg: 'You\'re using the application in another tab. This session has been invalidated.',
				closable: false,
				buttons: {}
			});
		}
	},

	setSessionId: function (id) {
		this.sessionId = id;
		TemporaryStorage.set(this.sessionTrackerKey, this.sessionId);
		this.sessionStarted = true;
	},

	setLogoutURL: function (url) {
		this.logOutURL = url;
	},

	getLogoutURL: function () {
		return this.logOutURL;
	},

	maybeAddImmediateAction: function (handshake) {
		var fakeService = window.Service || ModelService.create({}),
			links = handshake.Links;

		if (fakeService.getLinkFrom(links, 'account.profile.needs.updated')) {
			this.actions['show-coppa-window'] = true;
		} else if (fakeService.getLinkFrom(links, 'state-bounced-contact-email')) {
			this.actions['bounced-contact'] = true;
		} else if (fakeService.getLinkFrom(links, 'state-bounced-email')) {
			this.actions['bounced-email'] = true;
		} else if (fakeService.getLinkFrom('coppa.upgraded.rollbacked')) {
			this.actions['confirm-birthday-coppa'] = true;
		}

		if (fakeService.getLinkFrom(links, 'RegistrationSurvey')) {
			this.actions['submit-registration'] = fakeService.getLinkFrom(links, 'RegistrationSurvey');
		}
	},

	__shouldShowContentFor: function (linkRel) {
		return !Ext.isEmpty($AppConfig.userObject.getLink(linkRel));
	},

	//TODO: Fill this in from controller/Session
	takeImmediateAction: function () {
		var user = $AppConfig.userObject;
		let AccountActions = lazy.AccountActions.create();

		if (this.actions['show-coppa-window']) {
			AccountActions.maybeShowCoppaWindow();
		} else if (this.actions['bounced-contact']) {
			AccountActions.showEmailRecoveryWindow('contact_email', 'state-bounced-contact-email');
		} else if (this.actions['bounced-email']) {
			AccountActions.showEmailRecoveryWindow('email', 'state-bounced-email');
		}

		if (this.actions['confirm-birthday-coppa']) {
			AccountActions.showCoppaConfirmWindow();
		}

		//What is the exact relationships between these windows?
		//currently above and below are piling on top of one another
		if (this.__shouldShowContentFor('content.initial_welcome_page')) {
			AccountActions.showWelcomePage(user.getLink('content.initial_welcome_page'));
		}

		if (this.__shouldShowContentFor('irb_html')) {
			AccountActions.showResearchAgreement();
		}

		//NOTE we show the ToS last so it stacks on top. Need a better solution for this
		if (this.__shouldShowContentFor('content.initial_tos_page')) {
			AccountActions.showNewTermsOfService(user.getLink('content.initial_tos_page'));
		}

		if (this.actions['submit-registration']) {
			AccountActions.showRegistrationForm(this.actions['submit-registration']);
		}
	},

	willLogout: function (callback) {
		this.fireEvent('will-logout', callback);
	},

	onLogin: function () {
		var me = this;

		Promise.all(this.onLoginActions.map(function (action) { action.call(null); }))
			.then(this.fireEvent.bind(this, 'login-ready'))
			.then(function () {
				wait()
					.then(me.takeImmediateAction.bind(me));
			});
	},

	onSessionReady: function () {
		this.fireEvent('session-ready');
	},

	setActiveUser: function (user) {
		$AppConfig.userObject = UserRepository.cacheUser(user, true);

		$AppConfig.Preferences = PreferenceManager.create({
			href: user.get('href').split('?')[0] + '/++preferences++'
		});

		ObjectUtils.defineAttributes($AppConfig, {
			username: {
				getter: function () {
					try {
						return this.userObject.getId();
					} catch (e) {
						console.error(e.stack);
					}

					return null;
				},
				setter: function () { throw new Error( 'readonly' ); }
			}
		});
	},


	setService (doc) {
		this.__serviceDoc = doc;
		this.fireEvent('service-doc-set');
	},

	getService () {
		if (this.__serviceDoc) { return Promise.resolve(this.__serviceDoc); }

		return new Promise((fulfill) => {
			this.on({
				single: true,
				'service-doc-set': () => fulfill(this.__serviceDoc)
			});
		});
	}
});
