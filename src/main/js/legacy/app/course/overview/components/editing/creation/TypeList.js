const Ext = require('extjs');

require('./Type');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.creation.TypeList', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-typelist',
	cls: 'new-type-list',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		var showEditor = this.showEditorForType.bind(this),
			parentRecord = this.parentRecord,
			rootRecord = this.rootRecord;

		this.types = this.types || [];

		if (this.types.length === 0) {
			//TODO: add empty state? not sure how you would end up here...
			return;
		}

		this.add(this.types.reduce(function (acc, type) {
			if (!type.advanced || Service.canDoAdvancedEditing()) {
				acc.push({
					xtype: 'overview-editing-type',
					showEditor: showEditor,
					typeConfig: type,
					parentRecord: parentRecord,
					rootRecord: rootRecord
				});
			}

			return acc;
		}, []));
	}
});
