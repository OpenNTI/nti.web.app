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

	sessionTrackerCookie: 'sidt',


	init: function() {
		var me = this;

		me.listen({
			component: {
				'settings-menu [action=logout]': {
					'click': me.handleLogout
				},

				'coppa-birthday-form': {
					'refresh-service-doc': me.resolveService
				}
			}
		});


		me.sessionId = guidGenerator();

		me.sessionTracker = Ext.TaskManager.newTask({

			interval: 5000, //5 seconds
			run: function() {
				var v = PersistentStorage.get(me.sessionTrackerCookie);
				if (v && v !== me.sessionId) {
					console.error('GUI Session ID missmatch! Should be:', me.sessionId, 'got:', v);
					me.sessionTracker.stop();
					Socket.tearDownSocket();

					alert({
						icon: Ext.Msg.WARNING,
						title: 'Alert',
						msg: 'You\'re using the application in another tab. This session has been invalidated.',
						closable: false,
						buttons: null
					});
				} else if (!v) {
					console.warn('The GUI Session ID is not set!');
				}
			}
		});
	},


	handleLogout: function(keepTracker) {
		var me = this, url = getURL(Ext.String.urlAppend(
				this.logoutURL,
				'success=' + encodeURIComponent(location.href)));

		if (!keepTracker) {
			PersistentStorage.remove(this.sessionTrackerCookie);
		}

		function finishLoggingOut() {
			Socket.tearDownSocket();
			me.application.fireEvent('session-closed');
			location.replace(url);
		}

		Ext.getBody().mask('Signing Out');
		//Log here to help address #550.
		console.log('logout, redirect to ' + url);
		this.application.fireEvent('will-logout', finishLoggingOut);
		Ext.defer(finishLoggingOut, 6000);
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
		var user = $AppConfig.userObject,
				links = user.get('Links') || {};
		return links.getLinksForRel ? links.getLinksForRel(linkRel)[0] : null;
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
			PersistentStorage.set(me.sessionTrackerCookie, me.sessionId);
			me.sessionTracker.start();
			console.log('fireing session-ready');//card 1768
			app.fireEvent('session-ready');
			app.on('finished-loading', me.immediateAction, me);

			app.getController('Application').openViewport();
		}

		function showLogin(timedout) {
			var o = {},
					url = $AppConfig.server.login;

			if (location.pathname !== '/') {
				o['return'] = location.pathname;
			}

			if ($AppConfig.server.host !== ('//' + document.domain)) {
				o.host = $AppConfig.server.host;
			}

			url = Ext.String.urlAppend(url, Ext.Object.toQueryString(o));

			if (timedout) {
				alert({
					icon: Ext.Msg.ERROR,
					title: 'Request Timeout',
					msg: 'There was some issue preventing us from starting.\nPlease try again in a few minutes.',
					closable: false,
					buttons: null
				});
				return;
			}
			location.replace(url);
		}

		var me = this;
		me.attemptLogin(success, showLogin);
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


	attemptLogin: function(successCallback, failureCallback) {
		var m = this,
				s = $AppConfig.server,
				d = s.data, ping = 'logon.ping',
				r;

		try {

			r = {
				timeout: 60000,
				url: getURL(d + ping),
				callback: function(q, s, r) {
					var l = m.getLink(r, 'logon.handshake');
					if (!s || !l) {
						if (r.timedout) {
							console.log('Request timed out: ', r.request.options.url);
						}
						return Ext.callback(failureCallback, m, [r.timedout]);
					}

					return m.performHandshake(l, successCallback, failureCallback);
				}
			};
			Ext.Ajax.request(r);
		}
		catch (err) {
			alert('Could not request handshake from Server.\n' + err.message);
		}
	},


	performHandshake: function(link, successCallback, failureCallback) {
		var m = this,
				u = decodeURIComponent(Ext.util.Cookies.get('username')),
				handshakeTimer = setTimeout(m.handshakeRecovery, 30000),
				r;

		//NOTE: handshakeTimer will retry if it doesn't return before 30 seconds because it's been reported that
		//you can get into a bad state duringn handshake, so we want to interrupt that and try again.
		r = {
			method: 'POST',
			timeout: 60000,
			url: getURL(link),
			params: {
				username: u
			},
			callback: function(q, s, r) {
				clearTimeout(handshakeTimer);
				var l = m.getLink(r, 'logon.continue');
				if (!s || !l) {
					return failureCallback.call(m);
				}
				m.maybeTakeImmediateAction(r);
				m.logoutURL = m.getLink(r, 'logon.logout');


				Ext.Object.each({
					'content.permanent_general_privacy_page': 'privacy_policy',
					'content.permanent_tos_page': 'terms_of_service'
				}, function(server, local) {
					$AppConfig.links[local] = m.getLink(r, server);
				});


				return m.resolveService(successCallback, failureCallback);
			}
		};

		Ext.Ajax.request(r);
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


	resolveService: function(successFn, failureFn) {
		var m = this,
				s = $AppConfig.server, r;

		try {
			r = {
				url: getURL(s.data),
				timeout: 20000,
				headers: {
					'Accept': 'application/vnd.nextthought.workspace+json'
				},
				scope: this,
				callback: function(q, success, r) {
					if (!success) {
						alert({title: getString('Apologies'), msg: getString('Cannot load page.')});
						m.handleLogout();
						console.log('Could not resolve service document\nrequest:', q, '\n\nresponse:', r, '\n\n');
						return;
					}
					try {
						var sDoc = Ext.decode(r.responseText);
						sDoc = NextThought.model.Service.create(sDoc);


						if (!m.findResolveSelfWorkspace(sDoc)) {
							console.error('Could not locate ResolveSelf link in:', sDoc);
							Ext.Error.raise('bad service doc');
						}

						$AppConfig.service = sDoc;
						//If we're already logged in, then just call the success callback.
						if (!Ext.isEmpty($AppConfig.userObject)) {
							Ext.callback(successFn, null, arguments);
							return;
						}
						m.attemptLoginCallback($AppConfig.service, successFn);
					}
					catch (e) {
						console.error(Globals.getError(e));
						failureFn.call(m);
					}
				}
			};
			Ext.Ajax.request(r);
		}
		catch (e) {
			console.error('AttemptLogin Exception: ', Globals.getError(e));
		}
	},


	attemptLoginCallback: function(service, successCallback, failureCallback) {
		var me = this, href, workspace, r;
		Socket.setup();

		function onFailure() {
			console.log('could not resolve app user', arguments);
			failureCallback.call(me);
		}

		function onSuccess(user, prefs) {
			//we set the user's presence in the chat session-ready controller so we don't need to do it here.
			//user.data.Presence = NextThought.model.PresenceInfo.createFromPresenceString('Online');
			user.summaryObject = false;
			$AppConfig.userObject = UserRepository.cacheUser(user, true);
			$AppConfig.Preferences = NextThought.preference.Manager.create({href: user.get('href') + '/++preferences++'});
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
			successCallback.call(me);
		}

		workspace = this.findResolveSelfWorkspace(service);
		href = service.getLinkFrom((workspace || {}).Links || [], 'ResolveSelf');

		if (!href) {
			console.error('No link found to resolve app user', arguments);
			onFailure();
			return;
		}

		r = {
			url: getURL(href),
			scope: this,
			headers: {
				Accept: 'application/json'
			},
			callback: function(q, success, r) {
				var json, user;
				if (!success) {
					onFailure(arguments);
					return;
				}

				json = Ext.decode(r.responseText, true);
				user = json ? ParseUtils.parseItems(json) : null;
				user = user ? user.first() : null;

				if (user && user.get('Username') === workspace.Title) {
					onSuccess(user, json.Preferences);
				}
				else {
					onFailure(arguments);
				}
			}
		};
		Ext.Ajax.request(r);
	}
});
