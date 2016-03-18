var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.common.form.fields.ComboBox', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.nt-combobox',

	baseCls: 'nt-combobox',

	allowBlank: true,
	hideLabel: true,
	multiSelect: false,
	editable: false,

	enableKeyEvents: true,
	pickerOffset: [0, 5],

	listConfig: {
		ui: 'nt',
		plain: true,
		showSeparator: false,
		shadow: false,
		frame: false,
		border: false,
		cls: 'x-menu',
		baseCls: 'x-menu',
		itemCls: 'x-menu-item no-border',
		emptyText: '<div class="x-menu-item">' + getString('NextThought.view.form.fields.ComboBox.empty') + '</div>',
		xhooks: {
			initComponent: function() {
				this.callParent(arguments);
				this.itemSelector = '.x-menu-item';
			}
		}
	}
});
