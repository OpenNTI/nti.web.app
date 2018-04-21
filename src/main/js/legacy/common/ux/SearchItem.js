const Ext = require('@nti/extjs');

require('../form/fields/SimpleTextField');


module.exports = exports = Ext.define('NextThought.common.ux.SearchItem', {
	extend: 'NextThought.common.form.fields.SimpleTextField',
	alias: 'widget.search-menu-item',

	ui: 'nt',
	cls: 'search-box',

	constructor: function (config) {
		config.inputType = 'text';
		this.callParent(arguments);
	},

	afterRender: function () {
		this.callParent(arguments);
		this.inputEl.set({size: 13});

		this.mon(this.inputEl, {
			keydown: 'stop',
			keyup: 'stop',
			keypress: 'stop'
		});
	},

	stop: function (e) {
		//Because it is in a view, it is preventing the default function of space
		e.stopPropagation();
	}
});
