Ext.define('NextThought.app.course.overview.components.editing.creation.TypeList', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-typelist',

	requires: [
		'NextThought.app.course.overview.components.editing.creation.Type'
	],

	cls: 'new-type-list',

	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		var showEditor = this.showNewRecordEditor.bind(this),
			parentRecord = this.parentRecord;

		this.add(this.types.map(function(type) {
			return {
				xtype: 'overview-editing-type',
				showEditor: showEditor,
				typeConfig: type,
				parentRecord: parentRecord
			};
		}));
	}
});
