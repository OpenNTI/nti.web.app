const { getService } = require('@nti/web-client');
const Ext = require('@nti/extjs');
const { getString } = require('internal/legacy/util/Localization');
const LoginActions = require('internal/legacy/login/Actions');

const AccountActions = require('../../Actions');

require('internal/legacy/model/User');
require('./MenuItem');
require('./Presence');

module.exports = exports = Ext.define(
	'NextThought.app.account.identity.components.Settings',
	{
		extend: 'Ext.menu.Menu',
		alias: 'widget.settings-menu',
		cls: 'user-settings-menu',
		width: 260,

		defaults: {
			ui: 'nt-menuitem',
			xtype: 'menuitem',
			plain: true,
		},

		listeners: {
			//TODO: do we want these to hide on mouse out or just clicking outside?
			// 'mouseenter': 'cancelHide',
			// 'mouseleave': 'startHide'
		},

		initComponent() {
			this.callParent(arguments);
			this.addMenuItems();
		},

		async addMenuItems() {
			const service = await getService();
			const supportLinks = service.getSupportLinks();

			this.mon(Ext.getBody(), {
				click: e => {
					const link = e.getTarget('a[href]');
					const href = link?.getAttribute('href');
					if (
						supportLinks.supportContact === href &&
						supportLinks.internalSupport
					) {
						e.stopEvent();
						this.AccountActions.showContactUs();
					}
				},
			});

			var items = [],
				u = $AppConfig.userObject,
				welcomeLink = u.getLink('content.permanent_welcome_page'),
				childrenLink = u.getLink('childrens-privacy');

			this.AccountActions = AccountActions.create();
			this.LoginActions = LoginActions.create();

			items.push({
				xtype: 'account-menuitem',
				setMenuClosed: this.setMenuClosed.bind(this),
			});

			if (service.capabilities.canChat) {
				items.push({ xtype: 'presence-menu' });
				items.push({ xtype: 'menuseparator' });
			}

			if (!Ext.isEmpty(welcomeLink)) {
				items.push({
					handler: this.showWelcome.bind(this),
					text: getString('NextThought.view.menus.Settings.welcome'),
					link: welcomeLink,
				});
			}

			items.push({
				handler: this.showAbout.bind(this),
				text: getString('NextThought.view.menus.Settings.about'),
				href: supportLinks.about,
				target: '_blank',
				cls: 'settings-menu-about-item',
			});

			//disable help because there are now 3 seperate help documents for different environments.	ugh!
			//items.push({ handler: 'help', text: 'Help'})

			items.push({
				handler: this.showPrivacy.bind(this),
				text: getString('NextThought.view.menus.Settings.privacy'),
			});

			if (!Ext.isEmpty(childrenLink)) {
				items.push({
					handler: this.showChildPrivacy.bind(this),
					text: getString(
						'NextThought.view.menus.Settings.children.privacy'
					),
				});
			}

			items.push({
				handler: this.showTerms.bind(this),
				text: getString('NextThought.view.menus.Settings.terms'),
			});

			const contactItem = {
				handler: this.contactUs.bind(this),
				text: getString('NextThought.view.menus.Settings.contact'),
				cls: 'settings-menu-contact-item',
			};
			items.push(contactItem);

			const { supportContact } = supportLinks;

			if (supportContact) {
				const ensureProtocol = x =>
					!x || /^(mailto|https?):/i.test(x) ? x : `mailto:${x}`;

				Object.assign(contactItem, {
					onClick: Ext.emptyFn,
					autoEl: {
						tag: 'a',
						target: '_blank',
						href: ensureProtocol(supportContact),
						style: { textDecoration: 'none' },
					},
				});
			}

			const helpSiteLabel = getString(
				'NextThought.view.menus.Setting.helpSiteLabel',
				'Help Site'
			);

			if (supportLinks.help && helpSiteLabel) {
				items.push({
					handler: this.showHelpSite.bind(this),
					text: helpSiteLabel,
					href: supportLinks.help,
					cls: 'setting-help-site-menu-item',
				});
			}

			items.push({ xtype: 'menuseparator' });

			//Currently the impersonation link comes back even if we cannot impersonate... so lets add a gate above and beyond the presence of the link...
			if (
				$AppConfig.userObject.getLink('logon.nti.impersonate') &&
				/@nextthought\.com$/.test($AppConfig.username)
			) {
				items.push({
					handler: this.impersonate.bind(this),
					text: 'Impersonate User...',
				});
			}

			items.push({
				handler: this.logout.bind(this),
				text: getString('NextThought.view.menus.Settings.logout'),
			});

			this.add(items);
		},

		startHide() {
			var me = this;

			me.cancelHide();

			me.hideTimeout = setTimeout(function () {
				me.hide();
			}, 500);
		},

		cancelHide() {
			clearTimeout(this.hideTimeout);
		},

		showWelcome(item) {
			this.AccountActions.showWelcomePage(item.link);
		},

		showAbout(item) {
			this.AccountActions.showHref(item.href, item.target);
		},

		async showPrivacy() {
			const link = (await getService()).getSupportLinks().privacyPolicy;

			if (link) {
				this.AccountActions.showPrivacy(link);
			}
		},

		showChildPrivacy() {
			var link = $AppConfig.userObject.getLink('childrens-privacy');

			if (link) {
				this.AccountActions.showChildrensPrivacy(link);
			}
		},

		async showTerms(item) {
			var link = (await getService()).getSupportLinks().termsOfService;

			this.AccountActions.showTermsOfService(link);
		},

		contactUs() {
			this.AccountActions.showContactUs();
		},

		impersonate() {
			this.LoginActions.handleImpersonate();
		},

		logout() {
			this.LoginActions.handleLogout();
		},

		showHelpSite(item) {
			window.open(item.href, '_blank');
		},
	}
);
