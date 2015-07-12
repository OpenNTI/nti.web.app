Ext.define('NextThought.app.account.identity.components.Settings', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.settings-menu',

	requires: [
		'NextThought.app.account.identity.components.MenuItem',
		'NextThought.app.account.identity.components.Presence',
		'NextThought.app.account.Actions',
		'NextThought.login.Actions'
	],

	cls: 'user-settings-menu',
	width: 260,

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menuitem',
		plain: true
	},


	listeners: {
		//TODO: do we want these to hide on mouse out or just clicking outside?
		// 'mouseenter': 'cancelHide',
		// 'mouseleave': 'startHide'
	},


	initComponent: function() {
		this.callParent(arguments);

		var items = [],
			u = $AppConfig.userObject, contactItem,
			welcomeLink = u.getLink('content.permanent_welcome_page'),
			childsLink = u.getLink('childrens-privacy');

		this.AccountActions = NextThought.app.account.Actions.create();
		this.LoginActions = NextThought.login.Actions.create();

		items.push({xtype: 'account-menuitem', setMenuClosed: this.setMenuClosed.bind(this)});

		if (Service.canChat()) {
			items.push({xtype: 'presence-menu'});
			items.push({xtype: 'menuseparator'});
		}

		if (!Ext.isEmpty(welcomeLink)) {
			items.push({handler: this.showWelcome.bind(this), text: getString('NextThought.view.menus.Settings.welcome'), link: welcomeLink});
		}

		items.push({
			handler: this.showAbout.bind(this),
			text: getString('NextThought.view.menus.Settings.about'),
			href: Service.getSupportLinks().about,
			target: '_blank'
		});

		//disable help because there are now 3 seperate help documents for different environments.  ugh!
		//items.push({ handler: 'help', text: 'Help'})

		items.push({handler: this.showPrivacy.bind(this), text: getString('NextThought.view.menus.Settings.privacy')});

		if (!Ext.isEmpty(childsLink)) {
			items.push({handler: this.showChildPrivacy.bind(this), text: getString('NextThought.view.menus.Settings.childerns')});
		}

		items.push({handler: this.showTerms.bind(this), text: getString('NextThought.view.menus.Settings.terms')});

		contactItem = {handler: this.contactUs.bind(this), text: getString('NextThought.view.menus.Settings.contact')};
		items.push(contactItem);

		if (!Ext.isEmpty(Service.getSupportLinks().supportEmail)) {
			Ext.apply(contactItem, {
				onClick: Ext.emptyFn,
				autoEl: {
					tag: 'a',
					target: '_blank',
					href: 'mailto:' + Service.getSupportLinks().supportEmail,
					style: {textDecoration: 'none'}
				}
			});
		}

		items.push({xtype: 'menuseparator'});

		//Currently the impersonation link comes back even if we cannot impersonate... so lets add a gate above and beyond the presence of the link...
		if ($AppConfig.userObject.getLink('logon.nti.impersonate')&& (/@nextthought\.com$/).test($AppConfig.username)) {
			items.push({ handler: this.impersonate.bind(this), text: 'Impersonate User...' });
		}

		items.push({handler: this.logout.bind(this), text: getString('NextThought.view.menus.Settings.logout')});

		this.add(items);
	},


	startHide: function() {
		var me = this;

		me.cancelHide();

		me.hideTimeout = setTimeout(function() {
			me.hide();
		}, 500);
	},


	cancelHide: function() {
		clearTimeout(this.hideTimeout);
	},


	showWelcome: function(item) {
		this.AccountActions.showWelcomePage(item.link);
	},


	showAbout: function(item) {
		this.AccountActions.showHref(item.href, item.target);
	},


	showPrivacy: function() {
		var link = $AppConfig.userObject.getLink('content.permanent_general_privacy_page');

		if (link) {
			this.AccountActions.showPrivacy(link);
		}
	},


	showChildPrivacy: function() {
		var link = $AppConfig.userObject.getLink('childrens-privacy');

		if (link) {
			this.AccountActions.showChildrensPrivacy(link);
		}
	},


	showTerms: function(item) {
		var link = Service.getSupportLinks().termsOfService;

		this.AccountActions.showTermsOfService(link);
	},


	contactUs: function() {
		this.AccountActions.showContactUs();
	},


	impersonate: function() {
		this.LoginActions.handleImpersonate();
	},


	logout: function() {
		this.LoginActions.handleLogout();
	}
});
