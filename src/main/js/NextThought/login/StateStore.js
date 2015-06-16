Ext.define('NextThought.login.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: [
		'NextThought.preference.Manager',
		'NextThought.proxy.Socket',
		'NextThought.app.account.Actions'
	],

	sessionTrackerKey: 'sidt',
	actions: {},

	constructor: function() {
		this.callParent(arguments);

		this.AccountActions = NextThought.app.account.Actions.create();

		//Make sure the session is still valid when the window is focused
		this.mon(Ext.get(window), {
			focus: '__validateSession'
		});
	},


	setupSocket: function() {
		Socket.setup();
	},

	__validateSession: function() {
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


	setSessionId: function(id) {
		this.sessionId = id;
		TemporaryStorage.set(this.sessionTrackerKey, this.sessionId);
		this.sessionStarted = true;
	},


	setLogoutURL: function(url) {
		this.logOutURL = url;
	},


	getLogoutURL: function() {
		return this.logOutURL;
	},


	maybeAddImmediateAction: function(handshake) {
		var fakeService = window.Service || NextThought.model.Service.create({}),
			links = handshake.Links;

		if (fakeService.getLink(links, 'account.profile.needs.updated')) {
			this.actions['show-coppa-window'] = true;
		} else if (fakeService.getLink(links, 'state-bounced-contact-email')) {
			this.actions['bounced-contact'] = true;
		} else if (fakeService.getLink(links, 'state-bounced-email')) {
			this.actions['bounced-email'];
		} else if (fakeService.getLink('coppa.upgraded.rollbacked')) {
			this.actions['confirm-birthday-coppa'];
		}
	},


	__shouldShowContentFor: function(linkRel) {
		return !Ext.isEmpty($AppConfig.userObject.getLink(linkRel));
	},


	//TODO: Fill this in from controller/Session
	takeImmediateAction: function() {
		var user = $AppConfig.userObject;

		if (this.actions['show-coppa-window']) {
			this.AccountActions.maybeShowCoppaWindow();
		} else if (this.actions['bounced-contact']) {
			this.AccountActions.showEmailRecoveryWindow('contact_email', 'state-bounced-contact-email');
		} else if (this.actions['bounced-email']) {
			this.AccountActions.showEmailRecoveryWindow('email', 'state-bounced-email');
		}

		if (this.actions['confirm-birthday-coppa']) {
			this.AccountActions.showCoppaConfirmWindow();
		}

		//What is the exact relationships between these windows?
		//currently above and below are piling on top of one another
		if (this.__shouldShowContentFor('content.initial_welcome_page')) {
			this.AccountActions.showWelcomePage(user.getLink('content.initial_welcome_page'));
		}

		if (this.__shouldShowContentFor('irb_html')) {
			this.AccountActions.showResearchAgreement();
		}

		//NOTE we show the ToS last so it stacks on top. Need a better solution for this
		if (this.__shouldShowContentFor('content.initial_tos_page')) {
			this.AccountActions.showNewTermsOfService(user.getLink('content.initial_tos_page'));
		}
	},


	willLogout: function(callback) {
		this.fireEvent('will-logout', callback);
	},


	onLogin: function() {
		this.fireEvent('login-ready');
		wait().then(this.takeImmediateAction.bind(this));
	},


	onSessionReady: function() {
		this.fireEvent('session-ready');
	},


	setActiveUser: function(user) {
		$AppConfig.userObject = UserRepository.cacheUser(user, true);

		$AppConfig.Preferences = NextThought.preference.Manager.create({
			href: user.get('href').split('?')[0] + '/++preferences++'
 		});

 		ObjectUtils.defineAttributes($AppConfig, {
 			username: {
 				getter: function() {
 					try {
 						return this.userObject.getId();
 					} catch (e) {
 						console.error(e.stack);
 					}

 					return null;
 				},
 				setter: function() { throw 'readonly'; }
 			}
 		});
	}
});
