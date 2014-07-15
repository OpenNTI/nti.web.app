Ext.define('NextThought.controller.Session', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.cache.AbstractStorage',
		'NextThought.cache.UserRepository',
		'NextThought.preference.Manager',
		'NextThought.proxy.Socket',
		'NextThought.util.Object',
		'Ext.util.Cookies'
	],

	models: [
		'User',
		'Service'
	],

	views: [
		'account.coppa.Window',
		'account.coppa.upgraded.Window',
		'account.coppa.upgraded.Confirm',
		'account.recovery.Window',
		'menus.Settings',
		'NextThought.ux.WelcomeGuide',
		'NextThought.ux.UpdatedTos'
	],

	sessionTrackerKey: 'sidt',


	init: function() {
		this.ServiceInterface = NextThought.model.Service.create({});//we don't have the service doc yet, but we need the ajax helpers
		this.listen({
			component: {
				'settings-menu [action=logout]': {
					'click': this.handleLogout
				},

				'coppa-birthday-form': {
					'refresh-service-doc': this.resolveService
				}
			}
		});

		this.mon(Ext.get(window), {
			focus: 'onWindowActivated',
			blur: 'onWindowDeactivated'
		});
	},


	validate: function() {
		//checking
		console.log('Validating Session');
		var v = this.sessionStarted && TemporaryStorage.get(this.sessionTrackerKey);
		if (v !== this.sessionId && this.sessionStarted) {
			//console.error('GUI Session ID missmatch! Should be:', this.sessionId, 'got:', v);
			Socket.tearDownSocket();

			alert({
				icon: Ext.Msg.WARNING,
				title: 'Alert',
				msg: 'You\'re using the application in another tab. This session has been invalidated.',
				closable: false,
				buttons: null
			});
		}
	},


	onWindowActivated: function() {
		//console.debug('Tab/Window Activated');
		this.validate();
	},


	onWindowDeactivated: function() {
		//console.debug('Tab/Window Deactivated');
	},


	handleLogout: function() {
		var me = this,
			url = getURL(Ext.String.urlAppend(
				this.logoutURL,
				'success=' + encodeURIComponent(location.href)));

		TemporaryStorage.removeAll();

		function finishLoggingOut() {
			try {
				Socket.tearDownSocket();
				me.application.fireEvent('session-closed');
			}
			finally {
				location.replace(url);
			}

		}

		Ext.getBody().mask('Signing Out');
		//Log here to help address #550.
		console.log('logout, redirect to ' + url);
		Ext.defer(finishLoggingOut, 6000);//start the timer now just in case 'will-logout' blows up.
		this.application.fireEvent('will-logout', finishLoggingOut);
	},


	maybeShowCoppaWindow: function() {
		var user = $AppConfig.userObject,
				showWindow = user.getLink('account.profile.needs.updated'),
				url = user.getLink('account.profile'),
				req;

		if (!showWindow) {
			return;
		}

		req = {
			url: getURL(url),
			timeout: 20000,
			scope: this,
			callback: function(q, success, r) {
				if (!success) {
					console.log('Could not get acct rel schema for coppa window. Window will not show');
					return;
				}
				try {
					var o = Ext.decode(r.responseText);
					Ext.widget('coppa-window', {schema: o.ProfileSchema}).show();
				}
				catch (e) {
					console.error(Globals.getError(e));
				}
			}
		};

		Ext.Ajax.request(req);
		console.log('get data from ' + url + ' and show coppa window...');
	},


	showWelcomePage: function() {
		var link = this.linkElementForRel('content.initial_welcome_page');
		this.guideWin = Ext.widget('welcome-guide', {link: link, deleteOnDestroy: true});
		this.guideWin.show();
	},


	showCoppaConfirmWindow: function() {
		var link = this.linkElementForRel('coppa.upgraded.rollbacked');
		this.coppaConfirmWin = Ext.widget('coppa-confirm-window', {link: link, deleteOnDestroy: true});
		this.coppaConfirmWin.show();
	},


	showNewTermsOfService: function() {
		var link = this.linkElementForRel('content.initial_tos_page');
		this.guideWin = Ext.widget('updated-tos', {link: link, deleteOnDestroy: true});
		this.guideWin.show();
	},


	shouldShowContentFor: function(linkRel) {
		return !Ext.isEmpty(this.linkElementForRel(linkRel));
	},


	linkElementForRel: function(linkRel) {
		return $AppConfig.userObject.getLink(linkRel);
	},


	maybeTakeImmediateAction: function(r) {
		var m = this;
		if (m.getLink(r, 'account.profile.needs.updated')) {
			m.coppaWindow = true;
		}
		else if (m.getLink(r, 'state-bounced-contact-email')) {
			m.bouncedContact = true;
		}
		else if (m.getLink(r, 'state-bounced-email')) {
			m.bouncedEmail = true;
		}
		else if (m.getLink(r, 'coppa.upgraded.rollbacked')) {
			m.confirmBirthdayCoppa = true;
		}
	},


	showEmailRecoveryWindow: function(fieldName, linkName) {
		Ext.widget('recovery-email-window', {fieldName: fieldName, linkName: linkName}).show();
	},


	immediateAction: function() {
		if (this.coppaWindow) {
			this.maybeShowCoppaWindow();
		}
		else if (this.bouncedContact) {
			this.showEmailRecoveryWindow('contact_email', 'state-bounced-contact-email');
		}
		else if (this.bouncedEmail) {
			this.showEmailRecoveryWindow('email', 'state-bounced-email');
		}

		if (this.confirmBirthdayCoppa) {
			this.showCoppaConfirmWindow();
		}

		// what is the exactly relationships between these windows?
		// currently above and below are piling on top of one another
		if (this.shouldShowContentFor('content.initial_welcome_page')) {
			this.showWelcomePage();
		}

		//Note we show TOS last so it stacks on top.  Need a better solution for this
		if (this.shouldShowContentFor('content.initial_tos_page')) {
			this.showNewTermsOfService();
		}
	},


	login: function(app) {
		function success() {
			me.sessionId = B64.encodeURLFriendly($AppConfig.username);//weak obfuscation
			TemporaryStorage.set(me.sessionTrackerKey, me.sessionId);
			me.sessionStarted = true;
			console.log('fireing session-ready');//card 1768
			app.fireEvent('session-ready');
			app.on('finished-loading', me.immediateAction, me);

			app.getController('Application').openViewport();
		}

		function showLogin(reason) {
			var o = {},
				url = $AppConfig.server.login;

			if (location.pathname !== '/' || location.hash || location.search) {
				o['return'] = location.href;
			}

			/*if ($AppConfig.server.host !== ('//' + document.domain)) {
				o.host = $AppConfig.server.host;
			}*/

			url = Ext.String.urlAppend(url, Ext.Object.toQueryString(o));

			if (reason === 'timedout') {
				alert({
					icon: Ext.Msg.ERROR,
					title: 'Request Timeout',
					msg: 'There was some issue preventing us from starting. Please try again in a few minutes.',
					closable: false,
					buttons: null
				});
				return;
			}
			location.replace(url);
		}

		var me = this;

		me.attemptLogin().then(success, showLogin);
	},


	getLink: function getLink(o, relName) {
		o = o || {};
		o = o.responseText || o;
		if (typeof o === 'string') {
			try {
				o = Ext.decode(o);
			}
			catch (e) {
				console.error('could not decode', o);
				o = {};
			}
		}
		var l = o.Links || [], i = l.length - 1;
		for (i; i >= 0; i--) {
			if (l[i].rel === relName) {
				return l[i].href;
			}
		}
		return null;
	},


	attemptLogin: function() {
		var m = this,
			s = $AppConfig.server,
			d = s.data,
			ping = 'logon.ping';


		return m.ServiceInterface.request({ timeout: 60000, url: getURL(d + ping)})
				.then(function(r) { var l = m.getLink(r, 'logon.handshake'); if (!l) {throw '';} return l;})
				.fail(function(r) {
						if (r && r.timedout) {
							console.log('Request timed out: ', r.request.options.url);
						}
						throw 'timedout';
					})
				.then(m.performHandshake.bind(m));
	},


	performHandshake: function(link) {
		var m = this,
			u = decodeURIComponent(Ext.util.Cookies.get('username')),
			handshakeTimer = setTimeout(m.handshakeRecovery, 30000);

		//NOTE: handshakeTimer will retry if it doesn't return before 30 seconds because it's been reported that
		//you can get into a bad state duringn handshake, so we want to interrupt that and try again.

		return m.ServiceInterface.request({
			method: 'POST',
			timeout: 60000,
			url: getURL(link),
			callback: function() {clearTimeout(handshakeTimer);},
			params: {
				username: u
			}
		})
				.then(function(r) { if (!m.getLink(r, 'logon.continue')) { throw 'no link'; } return r; })
				.then(function(r) {
					m.maybeTakeImmediateAction(r);
					m.logoutURL = m.getLink(r, 'logon.logout');

					return m.resolveService()
							.then(function() {
								Ext.Object.each({
									'content.permanent_general_privacy_page': 'privacyPolicy',
									'content.permanent_tos_page': 'termsOfService'
								}, function(server, local) {
									Service.overrideServiceLink(local, m.getLink(r, server));
								});
							});
				});
	},


	handshakeRecovery: function() {
		Ext.util.Cookies.clear('username');
		location.reload();
	},


	findResolveSelfWorkspace: function(s) {
		var items = s.get('Items') || [],
				w = null, l;

		Ext.each(items, function(item) {
			var links = item.Links || [];
			l = s.getLinkFrom(links, 'ResolveSelf');
			if (l) {
				w = item;
				return false;
			}
			return true;
		});

		return w;
	},


	resolveService: function() {
		var m = this,
			s = $AppConfig.server;

		return m.ServiceInterface.request({
			url: getURL(s.data),
			timeout: 20000,
			headers: {
				'Accept': 'application/vnd.nextthought.workspace+json'
			},
			scope: this
		})
				.then(function(doc) {
					doc = NextThought.model.Service.create(Ext.decode(doc));

					if (!m.findResolveSelfWorkspace(doc)) {
						console.error('Could not locate ResolveSelf link in:', doc);
						Ext.Error.raise('bad service doc');
					}

					window.Service = $AppConfig.service = doc;

					if (Ext.isEmpty($AppConfig.userObject)) {
						return m.attemptLoginCallback(doc);
					}
				})
				.fail(function(r) {
					alert({title: getString('Apologies'), msg: getString('Cannot load page.')});
					m.handleLogout();
					console.log('Could not resolve service document\nrequest:', q, '\n\nresponse:', r, '\n\n');
					throw r;
				});
	},


	attemptLoginCallback: function(service) {
		var href, workspace;

		Socket.setup();

		workspace = this.findResolveSelfWorkspace(service);
		href = service.getLinkFrom((workspace || {}).Links || [], 'ResolveSelf');

		if (!href) {
			console.error('No link found to resolve app user', arguments);
			return Promise.reject('No link found to resolve app user.');
		}

		return service.request({
			url: getURL(href),
			scope: this,
			headers: {
				Accept: 'application/json'
			}
		})
				.then(function(r) { return ParseUtils.parseItems(Ext.decode(r))[0]; })
				.then(function(user) {
					if (user && user.get('Username') === workspace.Title) {
						return user;
					}
					throw 'Mismatch';
				})
				.then(function(user) {
					//we set the user's presence in the chat session-ready controller so we don't need to do it here.
					//user.data.Presence = NextThought.model.PresenceInfo.createFromPresenceString('Online');
					user.summaryObject = false;
					$AppConfig.userObject = UserRepository.cacheUser(user, true);
					$AppConfig.Preferences = NextThought.preference.Manager.create({href: user.get('href').split('?')[0] + '/++preferences++'});
					console.debug('Set app user to ', $AppConfig.userObject);
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

					return user;
				})
				.fail(function onFailure(reason) {
					console.log('could not resolve app user', reason);
					throw ['failed loading profile', reason];
				});
	}
});
