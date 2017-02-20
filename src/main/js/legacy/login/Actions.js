const Ext = require('extjs');
const {getService} = require('nti-web-client');
const Socket = require('legacy/proxy/Socket');
const AnalyticsUtil = require('legacy/util/Analytics');
const B64 = require('legacy/util/Base64');
const Globals = require('legacy/util/Globals');
const ParseUtils = require('legacy/util/Parsing');
const LoginStateStore = require('legacy/login/StateStore');
const ModelService = require('legacy/model/Service');

const {wait} = require('legacy/util/Promise');
const {TemporaryStorage} = require('legacy/cache/AbstractStorage');

module.exports = exports = Ext.define('NextThought.login.Actions', {
	constructor: function () {
		this.callParent(arguments);

		//we don't have the service doc yet, but we need the ajax helpers
		this.ServiceInterface = ModelService.create({});
		this.store = LoginStateStore.getInstance();
	},

	handleImpersonate: function () {
		var url = $AppConfig.userObject.getLink('logon.nti.impersonate'),
			username = url && prompt('What username do you want to impersonate?'),
			params;

		if (username) {
			params = Ext.Object.toQueryString({
				username: username,
				success: location.pathname
			});

			url = Ext.String.urlAppend(url, params);

			location.replace(url);
		}
	},

	handleLogout: function () {
		var me = this,
			url = Globals.getURL(Ext.String.urlAppend(
				me.store.getLogoutURL(),
				'success=' + encodeURIComponent('/login/')
			));

		TemporaryStorage.removeAll();

		function finishLoggingOut () {
			try {
				Socket.tearDownSocket();
				me.store.fireEvent('session-closed');
			} finally {
				location.replace(url);
			}
		}

		Ext.getBody().mask('Signing Out');
		//Log here to help address #550.
		console.log('logout, redirect to ' + url);

		//Start a timer now just in case 'will-logout' blows up.
		wait(60000)
			.then(finishLoggingOut);

		me.store.willLogout(finishLoggingOut);
	},

	__onLoginSuccess: function () {
		var me = this,
			setFromCookie, preference,
			field = 'useHighContrast',
			cookieName = 'use-accessibility-mode';

		me.store.setSessionId(B64.encodeURLFriendly($AppConfig.username));//weak obfuscation

		$AppConfig.Preferences.getPreference('WebApp')
			.then(function (value) {
				var pref = value.get(field),
					c = Ext.util.Cookies.get(cookieName);

				c = c === 'true' ? true : false;

				if (c && !pref) {
					setFromCookie = true;
				}

				preference = value;

				if (pref || c) {
					return Globals.loadStyleSheetPromise('/app/resources/css/accessibility.css', 'main-stylesheet')
						.catch(function () {
							throw new Error('Failed to load the accessibility style sheet');
						});
				}
			})
			.always(function () {
				me.store.onSessionReady();

				return wait();
			})
			.then(function () {
				me.store.onLogin();
				AnalyticsUtil.beginSession();

				return wait();
			})
			.then(function () {
				if (!setFromCookie) { return; }
				Ext.Msg.show({
					title: 'High Contrast mode',
					msg: 'You are using the site in high contrast mode. Do you want to make this your preferred version of the app?',
					buttons: {
						primary: {
							text: 'Yes',
							handler: function () {
								if (preference) {
									preference.set(field, true);
									preference.save();
								}
							}
						},
						secondary: {
							text: 'No',
							handler: function () {
								Ext.util.Cookies.set(cookieName, 'false');
							}
						}
					}
				});
			});
	},

	__onLoginFailure: function (reason) {
		var o = {},
			url = $AppConfig.login;

		if (location.pathname !== '/' || location.hash || location.search) {
			o['return'] = location.href;
		}

		if (reason === 'timedout') {
			alert({
				icon: 'error',
				title: 'Request Timeout',
				msg: 'There was some issue preventing us from starting. Please try again in a few minutes.',
				closable: false,
				buttons: {}
			});

			return;
		}

		url = Ext.String.urlAppend(url, Ext.Object.toQueryString(o));
		location.replace(url);

		return Promise.reject();
	},

	/**
	 * Get the user, and set up the service object
	 * @return {Promise} fulfills is successfully logged in
	 */
	login: function () {
		return this.__attemptLogin().then(this.__onLoginSuccess.bind(this), this.__onLoginFailure.bind(this));
	},

	__attemptLogin: function () {
		var me = this,
			dataserver = $AppConfig['server-path'],
			ping = 'logon.ping';

		return me.ServiceInterface.request({
			timeout: 60000,
			url: Globals.getURL(dataserver + ping)
		}).then(function (response) {
			response = Globals.parseJSON(response, true);

			var link = me.ServiceInterface.getLinkFrom(response.Links, 'logon.handshake'),
				siteFeatures = $AppConfig.features[response.Site];

			if (siteFeatures) {
				delete $AppConfig.features[response.Site];
				$AppConfig.features = Ext.apply(siteFeatures, $AppConfig.features);
			}

			if (!link) {
				return Promise.reject('No handshake link!');
			}

			return response;
		}).catch(function (reason) {
			if (reason && reason.timedout) {
				console.log('Request timedout: ', reason.request.options.url);
			}

			return Promise.reject('Timeout');
		}).then(me.performHandshake.bind(me));
	},

	performHandshake: function (pongFromPing) {
		var me = this,
			link = me.ServiceInterface.getLinkFrom(pongFromPing.Links, 'logon.handshake'),
			username = decodeURIComponent(Ext.util.Cookies.get('username')),
			handshakeTimer = setTimeout(me.handshakeRecovery, 30000);

		//NOTE: handshakeTimer will retry if it return before 30 seconds because it's been reported that
		//you can get into a bad state during handshake, so we want to interrupt that and try again.

		return me.ServiceInterface.request({
			method: 'POST',
			timeout: 60000,
			url: Globals.getURL(link),
			callback: function () { clearTimeout(handshakeTimer);},
			params: {
				username: username
			}
		})
			.then(function (response) {
				return Globals.parseJSON(response, true);
			})
			.then(function (response) {
				var resolveService, tosLink;

				me.store.maybeAddImmediateAction(response);
				me.store.setLogoutURL(me.ServiceInterface.getLinkFrom(response.Links, 'logon.logout'));
				tosLink = me.ServiceInterface.getLinkFrom(response.Links, 'content.direct_tos_link');

				if (me.ServiceInterface.getLinkFrom(response.Links, 'logon.continue')) {
					resolveService = me.resolveService();
				} else {
					resolveService = Promise.reject('No Continue Link');
				}

				resolveService.then(function () {
					if (tosLink) {
						Service.overrideServiceLink('termsOfService', tosLink);
					}
				});

				return resolveService;
			});
	},

	findResolveSelfWorkspace: function (service) {
		var items = service.get('Items') || [],
			w = null, l;

		Ext.each(items, function (item) {
			var links = item.Links || [];

			l = service.getLinkFrom(links, 'ResolveSelf');

			if (l) {
				w = item;
				return false;
			}

			return true;
		});

		return w;
	},

	resolveService: function () {
		var me = this,
			unauthed = {401: true, 403: true};

		return getService()
			.then(doc => JSON.stringify(doc))
			.then(function (doc) {
				doc = ModelService.create(Globals.parseJSON(doc));

				if (!me.findResolveSelfWorkspace(doc)) {
					console.error('Could not locate ResolveSelf link in:', doc);
					Ext.Error.raise('bad service doc');
				}

				//TODO: figure out how to get this off of window...
				window.Service = $AppConfig.service = doc;

				if (Ext.isEmpty($AppConfig.userObject)) {
					return me.attemptLoginCallback(doc);
				}
			})
			.catch(function (r) {
				if (unauthed[r.status]) {
					//Just let this fall through and reject. we can't
					//logout because we never logged in, when we reject
					//the failure handle gets called and we send the user to the
					//login page. -cutz
					//me.handleLogout();
				} else {
					alert({
						title: getString('Apologies'),
						msg: getString('Cannot load page.')
					});
				}

				console.log('Could not resolve service document\nrequest:', null, '\n\nresponse:', r, '\n\n');
				return Promise.reject(r);
			});
	},

	attemptLoginCallback: function (service) {
		var me = this,
			href, workspace;

		me.store.setupSocket();

		workspace = this.findResolveSelfWorkspace(service);
		href = service.getLinkFrom((workspace || {}).Links || [], 'ResolveSelf');

		if (!href) {
			console.error('No link found to resolve app user', arguments);
			return Promise.reject('No link found to resolve app user.');
		}

		return service.request({
			url: Globals.getURL(href),
			scope: this,
			headers: {
				Accept: 'application/json'
			}
		})
			.then(function (r) { return ParseUtils.parseItems(Globals.parseJSON(r))[0]; })
			.then(function (user) {
				if (user && user.get('Username') === workspace.Title) {
					return user;
				}
				return Promise.reject('Mismatch');
			})
			.then(function (user) {
				//we set the user's presence in the chat session-ready controller so we don't need to do it here.
				user.summaryObject = false;
				me.store.setActiveUser(user);

				return user;
			})
			.catch(function (reason) {
				console.log('could not resolve app user', reason);
				return Promise.reject(['failed loading profile', reason]);
			});
	}
});
