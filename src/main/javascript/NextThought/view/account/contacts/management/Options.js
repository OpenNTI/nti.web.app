Ext.define('NextThought.view.account.contacts.management.Options', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.person-options-menu',
	ui: 'nt',
	cls: 'person-options-menu',
	plain: true,
	shadow: false,
	width: 350,
	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			'beforecheckchange': function(item, checked) { return item.allowUncheck !== false; },
			'click': function(item) {item.up('menu').handleClick(item);}
		}
	},
	items: [
		{ text: 'Settings', cls: 'label', allowUncheck: false, header: true},
    //		{ text: 'Mute', allowSelect:true},
    //		{ text: 'Block', allowSelect:true},
		{ text: 'Remove from contacts', cls: 'no-checkbox', removeContact: true, allowSelect: true}
	],

	handleClick: function(item) {
		if (item.removeContact) {
			if (!this.isContact) { return; }
			this.fireEvent('remove-contact-selected', this, this.user);
		}

		//TODO: right now, we will use the header as a toggle option for showing and hiding the menu
		if (item.header) {
			this.fireEvent('hide-menu');
		}
	},

	afterRender: function() {
		this.closeEl = Ext.DomHelper.append(this.el, {cls: 'close', html: ''}, true);
		this.callParent(arguments);

		if (this.down('[removeContact=true]') && !this.isContact) {
			this.down('[removeContact=true]').setDisabled(true);
		}

		this.closeEl.on('click', function(e) {
			e.stopEvent();
			this.stopHideTimeout();
			this.doDismiss = true;
			this.isClosing = true;
			this.fireEvent('hide-menu');
			return false;
		}, this);


		this.mon(this.el, 'mouseover', function(e) {
			this.stopHideTimeout();
			this.doDismiss = false;
		}, this);

		this.mon(this.el, 'mouseout', function(e) {
			if (!this.isClosing) {
				this.startHideTimeOut();
			}
			this.isClosing = false;
			this.doDismiss = true;
		}, this);

		this.on('beforedeactivcate', function(e) {
			return this.doDismiss;
		}, this);
	},

	startHideTimeOut: function() {
		this.hideTimeout = Ext.defer(function() {
			this.fireEvent('hide-menu');
		}, 1000, this);
	},

	stopHideTimeout: function() {
		clearTimeout(this.hideTimeout);
	}
});
