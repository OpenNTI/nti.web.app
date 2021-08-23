const Ext = require('@nti/extjs');

module.exports = exports = Ext.define(
	'NextThought.app.badge.components.Footer',
	{
		extend: 'Ext.Component',
		alias: 'widget.badge-window-footer',

		cls: 'footer',

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'left',
				cn: [],
			},
			{ cls: 'right', cn: [{ cls: 'btn close', html: 'Close' }] },
		]),

		renderSelectors: {
			closeEl: '.close',
		},

		afterRender: function () {
			this.callParent(arguments);

			this.mon(this.closeEl, 'click', this.onCloseClick.bind(this));
		},

		onCloseClick: function (e) {
			if (this.doClose) {
				this.doClose(e);
			}
		},
	}
);
