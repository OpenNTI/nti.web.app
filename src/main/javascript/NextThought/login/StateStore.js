Ext.define('NextThought.login.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: [
		'NextThought.preference.Manager',
		'NextThought.proxy.Socket'
	],

	sessionTrackerKey: 'sidt',
	actions: [],

	constructor: function() {
		this.callParent(arguments);

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


	setLogOutURL: function(url) {
		this.setLogOutURL = url;
	},


	getLogOutURL: function() {
		return this.logOutURL;
	},


	maybeAddImmediateAction: function(handshake) {
		var fakeService = window.Service || NextThought.model.Service.create({}),
			links = handshake.Links;

		if (fakeService.getLink(links, 'account.profile.needs.updated')) {
			this.actions.push('show-coppa-window');
		} else if (fakeService.getLink(links, 'state-bounced-contact-email')) {
			this.actions.push('bounced-contact');
		} else if (fakeService.getLink(links, 'state-bounced-email')) {
			this.actions.push('bounced-email');
		} else if (fakeService.getLink('coppa.upgraded.rollbacked')) {
			this.actions.push('confirm-birthday-coppa');
		}
	},

	//TODO: Fill this in from controller/Session
	takeImmediateAction: function() {},


	willLogOut: function(callback) {
		this.fireEvent('will-logout', callback);
	},


	onLogin: function() {
		this.fireEvent('login-ready');
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
