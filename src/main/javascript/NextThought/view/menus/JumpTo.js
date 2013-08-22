Ext.define('NextThought.view.menus.JumpTo', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.jump-menu',
	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	minWidth: 200,
	maxWidth: 500,

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

	initComponent: function () {
		var me = this;
		this.callParent(arguments);
		this.on('click', this.handleClick, this);
	},


	handleClick: function (menu, item) {
		if (!item || !item.ntiid) {
			return;
		}

		if (item.rememberLastLocation) {
			this.fireEvent('set-last-location-or-root', item.ntiid);
			return;
		}

		this.fireEvent('set-location', item.ntiid);
	},


	afterRender: function () {
		this.callParent(arguments);
		if (!Ext.is.iPad) { // iPad doesn't need/want these
			this.mon(this, {
				scope: this,
				'mouseleave': this.startHide,
				'mouseenter': this.stopHide
			});
		}
	},


	startShow: function (el, align, offset) {
		this.stopHide();
		if (Ext.is.iPad) {
			// Want it to be more responsive to taps
			this.showBy(el, align, offset);
		}
		else {
			this.showTimeout = Ext.defer(this.showBy, 750, this, [el, align, offset]);
		}
	},


	stopShow: function () {
		this.startHide();
		clearTimeout(this.showTimeout);
	},


	startHide: function () {
		var me = this;
		me.stopHide();
		me.leaveTimer = setTimeout(function () {
			me.hide();
		}, 500);
	},


	stopHide: function () {
		clearTimeout(this.leaveTimer);
	}
});
