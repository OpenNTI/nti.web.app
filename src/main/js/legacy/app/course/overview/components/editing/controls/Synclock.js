var Ext = require('extjs');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.controls.Synclock', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-synclock',
	cls: 'nt-sync-lock',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'nt-sync-lock'}
	]),

	beforeRender: function () {
		this.callParent(arguments);

		const isLocked = this.record && this.record.hasLink('SyncUnlock');

		if (!Service.canDoAdvancedEditing() || !isLocked) {
			this.hide();
			return;
		}
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.color) {
			this.addCls(this.color);
		}
	}
});
