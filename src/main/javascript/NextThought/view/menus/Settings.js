Ext.define('NextThought.view.menus.Settings', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.settings-menu',
	requires: [
		'NextThought.view.menus.Presence',
		'NextThought.view.account.MenuItem'
	],
	cls: 'user-settings-menu',
	width: 260,

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menuitem',
		plain: true
	},

	listeners: {
		'mouseenter': 'cancelHide',
		'mouseleave': 'startHide'
	},

	initComponent: function() {
		this.callParent(arguments);

		//setup fields:
		var items = [],
				u = $AppConfig.userObject, contactItem,
				welcomeLink = u.getLink('content.permanent_welcome_page'),
				childsLink = u.getLink('childrens-privacy');

		items.push({ xtype: 'account-menuitem' });

		if (Service.canChat()) {
			items.push({ xtype: 'presence-menu'});
			items.push({ xtype: 'menuseparator'});
		}

		//items.push({ action: 'account', text: 'My Account'});

		if (!Ext.isEmpty(welcomeLink)) {
			items.push({ action: 'welcome', text: getString('NextThought.view.menus.Settings.welcome'), link: welcomeLink});
		}

		items.push({ action: 'about', text: getString('NextThought.view.menus.Settings.about'), href: Service.getSupportLinks().about, hrefTarget: '_blank'});

		//disable help because there are now 3 seperate help documents for different environments.  ugh!
		//items.push({ action: 'help', text: 'Help'});

		items.push({ action: 'privacy', text: getString('NextThought.view.menus.Settings.privacy')});
		if (!Ext.isEmpty(childsLink)) {
			items.push({ action: 'childrens-privacy', text: getString('NextThought.view.menus.Settings.childerns')});
		}
		items.push({ action: 'terms', text: getString('NextThought.view.menus.Settings.terms')});


		contactItem = { action: 'contact', text: getString('NextThought.view.menus.Settings.contact')};
		items.push(contactItem);
		if (!Ext.isEmpty(Service.getSupportLinks().supportEmail)) {
			Ext.apply(contactItem, {
				onClick: Ext.emptyFn,
				action: 'contact-someone-else',
				autoEl: {
					tag: 'a',
					target: '_blank',
					href: 'mailto:' + Service.getSupportLinks().supportEmail,
					style: {textDecoration: 'none'}
				}
			});
		}


		items.push({ xtype: 'menuseparator' });
		items.push({ action: 'logout', text: getString('NextThought.view.menus.Settings.logout')});

		//add!
		this.add(items);
	},

	startHide: function() {
		this.cancelHide();

		this.hideTimeout = Ext.defer(this.hide, 500, this);
	},

	cancelHide: function() {
		clearTimeout(this.hideTimeout);
	}

});
