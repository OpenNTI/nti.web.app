Ext.define('NextThought.view.menus.Settings', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.settings-menu',
	requires: [
		'NextThought.view.menus.Presence'
	],
	cls: 'user-settings-menu',
	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
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
			u = $AppConfig.userObject,
			welcomeLink = u.getLink('content.permanent_welcome_page'),
			childsLink = u.getLink('childrens-privacy');


		if ($AppConfig.service.canChat()) {
			items.push({ xtype: 'presence-menu'});
			items.push({ xtype: 'menuseparator'});
		}

		items.push({ action: 'account', text: 'My Account'});
		items.push({ action: 'profile', text: 'My Profile'});

		if (!Ext.isEmpty(welcomeLink)) {
			items.push({ action: 'welcome', text: 'Welcome Guide', link: welcomeLink});
		}

		items.push({ action: 'about', text: 'About', href: 'http://www.nextthought.com/', hrefTarget: '_blank'});

		//disable help because there are now 3 seperate help documents for different environments.  ugh!
		//items.push({ action: 'help', text: 'Help'});

		items.push({ action: 'privacy', text: 'Privacy'});
		if (!Ext.isEmpty(childsLink)) {
			items.push({ action: 'childrens-privacy', text: 'Children\'s Privacy'});
		}
		items.push({ action: 'terms', text: 'Terms of Service'});


		items.push({ action: 'contact', text: 'Contact Us'});

		items.push({ xtype: 'menuseparator' });
		items.push({ action: 'logout', text: 'Sign Out'});

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
