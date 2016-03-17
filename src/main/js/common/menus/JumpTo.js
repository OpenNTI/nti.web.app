export default Ext.define('NextThought.common.menus.JumpTo', {
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
		plain: true
	},

	cls: 'jump-menu',


	initComponent: function() {
		this.mixins.menuBehavior.constructor.call(this);
		//if (!this.parentMenu && !this.ownerButton) {
			//debugger;
		//}

		this.callParent(arguments);

		if (this.handleClick) {
			this.on('click', 'handleClick', this);
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		var owner = this.ownerCmp ||this.up();

		if (owner) {
			this.mon(owner, 'destroy', 'destroy');
		} else {
			wait(1).then(this.destroy.bind(this));
		}
	}
});
