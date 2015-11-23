Ext.define('NextThought.app.course.overview.components.editing.Window', {
	extend: 'Ext.container.Container',
	//this is only extended, never should need to be instantiated

	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading'
	],

	cls: 'editing-window',
	layout: 'none',
	items: [],

	newItemText: 'New Object',

	initComponent: function() {
		this.callParent(arguments);

		this.record = this.precache.record;
		this.parentRecord = this.precache.parent || (this.record && this.record.parent);

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.doClose.bind(this)
		});

		this.setPath(this.record, this.parentRecord);

		this.editRecord(this.record);
	},


	setPath: function(record, parentRecord) {
		var titles = [], leaf,
			parent = parentRecord;

		while (parent) {
			if (parent.getTitle) {
				titles.push({label: parent.getTitle(), noLink: true});
			}

			parent = parent.parent;
		}

		if (record) {
			leaf = record.getTitle();
		} else {
			leaf = this.newItemText;
		}

		this.headerCmp.showPath(titles, leaf);
	},


	editRecord: function(record) {}
});
