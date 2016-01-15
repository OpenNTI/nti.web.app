Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Reading', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-reading',

	requires: [
		'NextThought.app.content.Actions',
		'NextThought.app.course.overview.components.editing.content.contentlink.ReadingSelection',
		'NextThought.app.course.overview.components.editing.content.contentlink.ReadingEditor'
	],

	SWITCHED: 'switched-items',

	statics: {
		getTypes: function() {
			return [
				{
					title: 'From Catalog',
					advanced: true,
					category: 'content',
					iconCls: 'reading',
					description: '',
					editor: this
				}
			];
		},

		//TODO: override getEditorForRecord to check if the related work ref
		//is pointing to a reading
		getEditorForRecord: function(record) {
			if (record.isContent()) {
				return this;
			}
		}
	},

	cls: 'content-editor reading-editor',

	initComponent: function() {
		this.ContentActions = NextThought.app.content.Actions.create();

		this.callParent(arguments);
	},


	showEditor: function() {
		if (this.record) {
			//TODO: fill this out
		} else {
			this.showReadingList();
		}
	},


	showReadingList: function(selectedItems) {
		var me = this;

		if (this.readingSelectionCmp) {
			this.readingSelectionCmp.destroy();
			delete this.readingSelectionCmp;
		}

		if (this.readingEditorCmp) {
			this.readingEditorCmp.destroy();
			delete this.readingEditorCmp;
		}

		me.removeAll(true);

		me.readingSelectionCmp = me.add({
			xtype: 'overview-editing-reading-selection',
			onSelectionChanged: this.onReadingListSelectionChange.bind(this),
			selectedItems: selectedItems
		});

		ContentUtils.getReadings(this.bundle)
			.then(function(readings) {
				if (readings.length > 1) {
					console.warn('Dont know how to handle more than one set of readings, just picking the first.');
				}

				readings = readings[0];

				me.readingSelectionCmp.setSelectionItems(readings);
			});
	},


	showReadingEditor: function() {
		if (this.readingEditorCmp) {
			this.viedoEditorCmp.destroy();
			delete this.readingEditorCmp;
		}

		this.readingEditorCmp = this.add({
			xtype: 'overview-editing-reading-editor',
			record: this.record,
			parentRecord: this.parentRecord,
			rootRecord: this.rootRecord,
			selectedItems: this.readingSelectionCmp && this.readingSelectionCmp.getSelection(),
			doClose: this.doClose,
			showError: this.showError,
			enableSave: this.enableSave,
			disableSave: this.disableSave,
			setSaveText: this.setSaveText
		});

		if (this.readingSelectionCmp) {
			this.readingSelectionCmp.destroy();
			delete this.readingSelectionCmp;
		}
	},


	onReadingListSelectionChange: function(selection) {
		var length = selection.length;

		this.setSaveText('Select');

		if (length === 0) {
			this.disableSave();
		} else {
			this.enableSave();
		}
	},


	doValidation: function() {
		return Promise.resolve();
	},


	onSave: function() {
		var me = this;

		if (!me.readingEditorCmp) {
			me.showReadingEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.readingEditorCmp.onSave()
			.fail(function(reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	}
});
