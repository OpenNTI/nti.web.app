const Ext = require('@nti/extjs');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.controls.Synclock', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-synclock',
	cls: 'nt-button synclock',

	beforeRender: function () {
		this.callParent(arguments);

		let isLocked;

		if (this.contents) {
			isLocked = this.contents.data && this.contents.data.Links
				&& this.contents.data.Links.hasLink('SyncUnlock');
		} else {
			isLocked = this.record && this.record.hasLink('SyncUnlock');
		}

		if (!Service.canDoAdvancedEditing() || !isLocked) {
			this.hide();
		}
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.color) {
			this.addCls(this.color);
		}
	}
});
