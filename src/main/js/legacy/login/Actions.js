const Ext = require('@nti/extjs');
const { getService, getServer } = require('@nti/web-client');
const { wait } = require('@nti/lib-commons');
const { init } = require('@nti/lib-locale');
const { getString } = require('internal/legacy/util/Localization');
const AnalyticsUtil = require('internal/legacy/util/Analytics');
const B64 = require('internal/legacy/util/Base64');
const Globals = require('internal/legacy/util/Globals');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const LoginStateStore = require('internal/legacy/login/StateStore');
const ModelService = require('internal/legacy/model/Service');
const { TemporaryStorage } = require('internal/legacy/cache/AbstractStorage');

const { location: locationHref } = global;

module.exports = exports = Ext.define('NextThought.login.Actions', {
	constructor() {
		this.callParent(arguments);

		//we don't have the service doc yet, but we need the ajax helpers
		this.ServiceInterface = ModelService.create({});
		this.store = LoginStateStore.getInstance();
	},

	handleImpersonate() {
		var url = $AppConfig.userObject.getLink('logon.nti.impersonate'),
			username =
				url && prompt('What username do you want to impersonate?'),
			params;

		if (username) {
			params = Ext.Object.toQueryString({
				username: username,
				success: locationHref.pathname,
			});

			url = Ext.String.urlAppend(url, params);

			locationHref.replace(url);
		}
	},

	async handleLogout() {
		const url = Globals.getURL(
			Ext.String.urlAppend(
				this.store.getLogoutURL(),
				'success=' + encodeURIComponent('/login/')
			)
		);

		TemporaryStorage.removeAll();

		Ext.getBody().mask('Signing Out');
		//Log here to help address #550.
		console.log('logout, redirect to ' + url);

		try {
			await new Promise((done, timeout) => {
				const lag = setTimeout(timeout, 10000);
				this.store.willLogout(() => {
					clearTimeout(lag), done();
				});
			});
		} catch {
			// timeout
		} finally {
			try {
				getServer().getWebSocketClient().tearDown();
				this.store.fireEvent('session-closed');
			} finally {
				locationHref.replace(url);
			}
		}
	},

	async __onLoginSuccess() {
		let setFromCookie, preference;
		const field = 'useHighContrast';
		const cookieName = 'use-accessibility-mode';

		this.store.setSessionId(B64.encodeURLFriendly($AppConfig.username)); //weak obfuscation

		try {
			const value = await $AppConfig.Preferences.getPreference('WebApp');

			var pref = value.get(field),
				c = Ext.util.Cookies.get(cookieName);

			c = c === 'true' ? true : false;

			if (c && !pref) {
				setFromCookie = true;
			}

			preference = value;

			if (pref || c) {
				try {
					await Globals.loadStyleSheetPromise(
						'/app/resources/css/accessibility.css',
						'main-stylesheet'
					);
				} catch {
					throw new Error(
						'Failed to load the accessibility style sheet'
					);
				}
			}
		} finally {
			this.store.onSessionReady();

			await wait();
		}
		await init();

		await AnalyticsUtil.beginSession();
		await this.store.onLogin();

		await wait();

		if (!setFromCookie) {
			return;
		}
		Ext.Msg.show({
			title: 'High Contrast mode',
			msg: 'You are using the site in high contrast mode. Do you want to make this your preferred version of the app?',
			buttons: {
				primary: {
					text: 'Yes',
					handler() {
						if (preference) {
							preference.set(field, true);
							preference.save();
						}
					},
				},
				secondary: {
					text: 'No',
					handler() {
						Ext.util.Cookies.set(cookieName, 'false');
					},
				},
			},
		});
	},

	__onLoginFailure(reason) {
		let url = '/login/';
		const o = {};

		if (
			locationHref.pathname !== '/' ||
			locationHref.hash ||
			locationHref.search
		) {
			o['return'] = locationHref.href;
		}

		if (reason === 'timedout') {
			alert({
				icon: 'error',
				title: 'Request Timeout',
				msg: 'There was some issue preventing us from starting. Please try again in a few minutes.',
				closable: false,
				buttons: {},
			});

			return;
		}

		url = Ext.String.urlAppend(url, Ext.Object.toQueryString(o));
		locationHref.replace(url);
	},

	/**
	 * Get the user, and set up the service object
	 *
	 * @returns {Promise} fulfills is successfully logged in
	 */
	async login() {
		try {
			await this.__attemptLogin();
			await this.__onLoginSuccess();
		} catch (e) {
			// Send to login
			this.__onLoginFailure(e);
		}
	},

	async __attemptLogin() {
		var dataserver = $AppConfig['server-path'],
			ping = 'logon.ping';

		try {
			const response = Globals.parseJSON(
				await this.ServiceInterface.request({
					timeout: 60000,
					url: Globals.getURL(dataserver + ping),
				}),
				true
			);

			const link = this.ServiceInterface.getLinkFrom(
				response.Links,
				'logon.handshake'
			);
			const siteFeatures = $AppConfig.features?.[response.Site];

			if (siteFeatures) {
				delete $AppConfig.features[response.Site];
				Object.assign($AppConfig.features, siteFeatures);
			}

			if (!link) {
				return Promise.reject('No handshake link!');
			}

			return this.performHandshake(response);
		} catch (reason) {
			if (reason?.timedout) {
				console.log('Request timed out: ', reason.request.options.url);
			}

			throw reason;
		}
	},

	async performHandshake(pongFromPing) {
		const link = this.ServiceInterface.getLinkFrom(
			pongFromPing.Links,
			'logon.handshake'
		);
		const username = decodeURIComponent(Ext.util.Cookies.get('username'));
		const handshakeTimer = setTimeout(this.handshakeRecovery, 30000);

		//NOTE: handshakeTimer will retry if it return before 30 seconds because it's been reported that
		//you can get into a bad state during handshake, so we want to interrupt that and try again.

		const response = Globals.parseJSON(
			await this.ServiceInterface.request({
				method: 'POST',
				timeout: 60000,
				url: Globals.getURL(link),
				callback() {
					clearTimeout(handshakeTimer);
				},
				params: {
					username: username,
				},
			}),
			true
		);

		if (
			!this.ServiceInterface.getLinkFrom(response.Links, 'logon.continue')
		) {
			throw new Error('No Continue Link');
		}

		this.store.maybeAddImmediateAction(response);
		this.store.setLogoutURL(
			this.ServiceInterface.getLinkFrom(response.Links, 'logon.logout')
		);

		await this.resolveService();
	},

	findResolveSelfWorkspace(service) {
		var items = service.get('Items') || [],
			w = null,
			l;

		Ext.each(items, item => {
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

	async resolveService() {
		const unauthorized = { 401: true, 403: true };

		try {
			const service = await getService();
			const raw = JSON.stringify(service);
			const doc = ModelService.create(Globals.parseJSON(raw));

			if (!this.findResolveSelfWorkspace(doc)) {
				console.error('Could not locate ResolveSelf link in:', doc);
				Ext.Error.raise('bad service doc');
			}

			this.service = $AppConfig.service = doc;
			// TODO: work through all the global references of Service to obtain the service doc from this action/store.
			Object.defineProperty(window, 'Service', {
				get() {
					// console.trace('Stop referencing Service from global.');
					return doc;
				},
			});
			this.store.setService(doc);

			if (Ext.isEmpty($AppConfig.userObject)) {
				return this.attemptLoginCallback(doc);
			}
		} catch (reason) {
			if (unauthorized[reason.status]) {
				//Just let this fall through and reject. we can't
				//logout because we never logged in, when we reject
				//the failure handle gets called and we send the user to the
				//login page. -cutz
				//this.handleLogout();
			} else {
				console.error(
					'Could not resolve service document.\n',
					reason.stack || reason.message || reason
				);

				return new Promise((_, reject) => {
					alert({
						title: getString('Apologies'),
						msg: getString('Cannot load page.'),
						fn: () => reject(reason),
					});
				});
			}

			throw reason;
		}
	},

	async attemptLoginCallback(service) {
		var href, workspace;

		this.store.setupSocket();

		workspace = this.findResolveSelfWorkspace(service);
		href = service.getLinkFrom(
			(workspace || {}).Links || [],
			'ResolveSelf'
		);

		if (!href) {
			console.error('No link found to resolve app user', arguments);
			return Promise.reject('No link found to resolve app user.');
		}

		try {
			const response = await service.request({
				url: Globals.getURL(href),
				scope: this,
				headers: {
					Accept: 'application/json',
				},
			});
			const user = lazy.ParseUtils.parseItems(
				Globals.parseJSON(response)
			)[0];
			if (!user || user.get('Username') !== workspace.Title) {
				throw new Error('Mismatch');
			}

			//we set the user's presence in the chat session-ready controller so we don't need to do it here.
			user.summaryObject = false;
			this.store.setActiveUser(user);

			return user;
		} catch (reason) {
			console.error('could not resolve app user', reason);
			throw reason;
		}
	},
});
