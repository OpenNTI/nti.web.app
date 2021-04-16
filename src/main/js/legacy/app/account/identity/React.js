const Ext = require('@nti/extjs');
const { getService } = require('@nti/web-client');
const { Identity } = require('@nti/web-profiles');
const LoginActions = require('internal/legacy/login/Actions');
require('internal/legacy/overrides/ReactHarness');

const AccountActions = require('../Actions');

module.exports = exports = Ext.define(
	'NextThought.app.account.identity.React',
	{
		extend: 'NextThought.ReactHarness',
		alias: 'widget.identity-react',
		component: Identity.Session,

		setTheme(scope, knockout) {},

		initComponent: function () {
			this.callParent(arguments);
			Object.assign(this.initialConfig, {
				addHistory: true,
				baseroute: '/app',
			});
			this.AccountActions = AccountActions.create();
			this.LoginActions = LoginActions.create();
		},

		async afterRender() {
			this.callParent(arguments);
			const service = await getService();
			const supportLinks = service.getSupportLinks();

			this.mon(Ext.getBody(), {
				click: this.onBodyClicks.bind(this, supportLinks),
			});
		},

		onBodyClicks(supportLinks, e) {
			let action = e.getTarget('a[data-action]')?.dataset.action;
			const link = e.getTarget('a[href]');
			const href = link?.getAttribute('href');

			// This is used to launch support logic the same way everywhere
			// we have a link that goes to the supportContact url. (so we can
			// just emit that url in the dom and not worry about coping logic)
			if (
				supportLinks.supportContact === href &&
				supportLinks.internalSupport
			) {
				action = action || 'support';
			}

			if (action) {
				if (call(this, `do-${action}`, link, e) !== false) {
					e.stopEvent();
				}
			}
		},

		showLink(target) {
			target.setAttribute('target', '_blank');
			return false;
		},

		'do-welcomeGuide'(target) {
			this.AccountActions.showWelcomePage(target.href);
		},

		'do-about': 'showLink',

		'do-privacy'(target) {
			this.AccountActions.showPrivacy(target);
		},

		'do-privacyForMinors'(target) {
			this.AccountActions.showChildrensPrivacy(target.href);
		},

		'do-terms'(target) {
			this.AccountActions.showTermsOfService(target.href);
		},

		'do-support'(target) {
			this.AccountActions.showContactUs();
		},

		'do-helpSite': 'showLink',

		'do-impersonate'() {
			this.LoginActions.handleImpersonate();
		},

		'do-logout'() {
			this.LoginActions.handleLogout();
		},
	}
);

function call(scope, action, ...args) {
	if (typeof action === 'string') {
		return call(scope, scope[action], ...args);
	}

	return action.apply(scope, args);
}
