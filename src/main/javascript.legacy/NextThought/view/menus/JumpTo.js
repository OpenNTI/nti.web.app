Ext.define('NextThought.view.menus.JumpTo', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.jump-menu',
	minWidth: 200,
	maxWidth: 500,

	mixins: {
		menuBehavior: 'NextThought.mixins.MenuShowHideBehavior'
	},

	layout: {
		type: 'vbox',
		align: 'stretch',
		overflowHandler: 'Scroller'
	},

	defaults: {
		ui: 'jumpto-menuitem',
		plain: true
	},

	cls: 'jump-menu',


	initComponent: function() {
		this.mixins.menuBehavior.constructor.call(this);
		//if (!this.parentMenu && !this.ownerButton) {
			//debugger;
		//}

		this.callParent(arguments);
		this.on('click', 'handleClick', this);
	},


	handleClick: function(menu, item) {
		if (!item || !item.ntiid) {
			return;
		}

		this.fireEvent('set-location', item.ntiid, null, null, this.bundle);
	},


	afterRender: function() {
		this.callParent(arguments);

		var owner = this.up();

		if (owner) {
			this.mon(owner, 'destroy', 'destroy');
		} else {
			wait(1).then(this.destroy.bind(this));
		}
	}
});
