const Ext = require('@nti/extjs');

module.exports = exports = Ext.define(
	'NextThought.overrides.panel.Panel',
	{
		override: 'Ext.panel.Panel',

		render: function () {
			this.callParent(arguments);
			if (!this.enableSelect) {
				this.el.unselectable();
			} else {
				this.el.selectable();
			}
		},
	},
	function () {
		Ext.getBody().unselectable();
	}
);
