var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.controls.SwitchType', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-switch-type',
	name: 'Switch Type',
	cls: 'nt-button switch-type',
	renderTpl: '{name}',

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.name
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.color) {
			this.addCls(this.color);
		}

		this.mon(this.el, 'click', this.handleClick.bind(this));
	},

	handleClick: function () {
		if (this.onSwitch) {
			this.onSwitch();
		}
	}
});
